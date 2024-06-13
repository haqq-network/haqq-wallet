import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionNftConfirmation} from '@app/components/transaction-nft-confirmation';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {useError} from '@app/hooks/use-error';
import {Contact} from '@app/models/contact';
import {ContractType} from '@app/models/nft';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {CalculatedFees} from '@app/services/eth-network/types';
import {EthSignErrorDataDetails} from '@app/services/eth-sign';
import {EventTracker} from '@app/services/event-tracker';
import {
  MarketingEvents,
  ModalType,
  SendTransactionError,
  TransactionResponse,
} from '@app/types';
import {makeID} from '@app/utils';

const UNPREDICTABLE_GAS_LIMIT = 'UNPREDICTABLE_GAS_LIMIT';

export const TransactionNftConfirmationScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionNftConfirmation
  >();
  const {nft} = route.params;

  const wallet = Wallet.getById(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );

  const showError = useError();
  const [soulboundTokenHint, setSoulboundTokenHint] = useState<string>('');
  const [disabled, setDisabled] = useState(false);
  const [fee, setFee] = useState<CalculatedFees | null>();

  useLayoutEffectAsync(async () => {
    setSoulboundTokenHint('');

    try {
      if (nft.contractType === ContractType.erc721) {
        const calculatedFees = await EthNetwork.estimateERC721Transfer(
          wallet?.address!,
          route.params.to,
          nft.tokenId,
          AddressUtils.toEth(nft.contract),
        );
        setFee(calculatedFees);
      } else {
        const calculatedFees = await EthNetwork.estimateERC1155Transfer(
          wallet?.address!,
          route.params.to,
          nft.tokenId,
          AddressUtils.toEth(nft.contract),
        );
        setFee(calculatedFees);
      }
    } catch (err) {
      const e = err as SendTransactionError;
      if (e.code === UNPREDICTABLE_GAS_LIMIT) {
        const idx = e.reason.lastIndexOf(': ');
        const errorText = idx !== -1 ? e.reason.substring(idx + 1) : '';
        setSoulboundTokenHint(errorText);
      }
    }
  }, []);

  const onConfirmTransaction = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork();

        const provider = await getProviderInstanceForWallet(wallet, false);

        let transaction: TransactionResponse | null = null;
        if (fee) {
          if (nft.contractType === ContractType.erc721) {
            transaction = await ethNetworkProvider.transferERC721(
              fee,
              provider,
              wallet,
              route.params.to,
              nft.tokenId,
              AddressUtils.toEth(nft.contract),
            );
          } else {
            transaction = await ethNetworkProvider.transferERC1155(
              fee,
              provider,
              wallet,
              route.params.to,
              nft.tokenId,
              AddressUtils.toEth(nft.contract),
            );
          }
        }

        if (transaction) {
          EventTracker.instance.trackEvent(MarketingEvents.sendFund);

          navigation.navigate(TransactionStackRoutes.TransactionNftFinish, {
            nft: route.params.nft,
            transaction,
            to: route.params.to,
            fee,
          });
        }
      } catch (e) {
        const errorId = makeID(4);

        Logger.captureException(e, 'transaction-nft-confirmation', {
          from: route.params.from,
          to: route.params.to,
          nft: nft,
          id: errorId,
          walletType: wallet.type,
          contact,
          provider: app.provider.name,
        });

        const err = e as EthSignErrorDataDetails;
        const txInfo = err?.transaction;
        const errCode = err?.code;

        if (
          !!txInfo?.gasLimit &&
          !!txInfo?.maxFeePerGas &&
          errCode === 'INSUFFICIENT_FUNDS'
        ) {
          err.handled = true;
          const gasLimit = new Balance(txInfo.gasLimit).operate(
            new Balance(txInfo.gasPrice || txInfo.maxFeePerGas),
            'mul',
          );
          showModal(ModalType.notEnoughGas, {
            gasLimit: gasLimit,
            currentAmount: app.getAvailableBalance(wallet!.address),
          });
          return;
        }

        // @ts-ignore
        const errMsg = e?.message || e?.toString?.() || JSON.stringify(e);
        if (errMsg) {
          showError(errorId, errMsg);
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [fee, navigation, nft, route.params.from, route.params.to, wallet]);

  return (
    <TransactionNftConfirmation
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      item={route.params.nft}
      soulboundTokenHint={soulboundTokenHint}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
    />
  );
});
