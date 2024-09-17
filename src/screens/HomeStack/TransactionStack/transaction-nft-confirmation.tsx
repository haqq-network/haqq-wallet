import React, {useCallback, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {observer} from 'mobx-react';

import {TransactionNftConfirmation} from '@app/components/transaction-nft-confirmation';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForFee} from '@app/helpers/await-for-fee';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {useError} from '@app/hooks/use-error';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {EstimationVariant, Fee} from '@app/models/fee';
import {ContractType} from '@app/models/nft';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork, sendNotification} from '@app/services';
import {Balance} from '@app/services/balance';
import {getERC1155TransferData} from '@app/services/eth-network/erc1155';
import {getERC721TransferData} from '@app/services/eth-network/erc721';
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

  const [fee, setFee] = useState<Fee | null>(null);

  const wallet = Wallet.getById(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );
  const provider = Provider.getByEthChainId(nft.chain_id);

  const showError = useError();
  const [soulboundTokenHint, setSoulboundTokenHint] = useState<string>('');
  const [disabled, setDisabled] = useState(false);
  const [feeData, setFeeData] = useState('0x');

  useLayoutEffectAsync(async () => {
    setSoulboundTokenHint('');

    try {
      let data;
      if (nft.contractType === ContractType.erc721) {
        data = getERC721TransferData(
          wallet?.address!,
          route.params.to,
          nft.tokenId,
        );
      } else {
        data = getERC1155TransferData(
          wallet?.address!,
          route.params.to,
          nft.tokenId,
        );
      }
      setFeeData(data);
      if (!fee?.calculatedFees) {
        const calculatedFees = await EthNetwork.estimate(
          {
            from: wallet?.address!,
            to: AddressUtils.toEth(nft.contract),
            data,
          },
          EstimationVariant.average,
          provider,
        );
        setFee(new Fee(calculatedFees));
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

        const walletProvider = await getProviderInstanceForWallet(
          wallet,
          false,
        );

        let transaction: TransactionResponse | null = null;
        if (fee?.calculatedFees) {
          if (nft.contractType === ContractType.erc721) {
            transaction = await ethNetworkProvider.transferERC721(
              fee.calculatedFees,
              walletProvider,
              wallet,
              route.params.to,
              nft.tokenId,
              AddressUtils.toEth(nft.contract),
              provider,
            );
          } else {
            transaction = await ethNetworkProvider.transferERC1155(
              fee.calculatedFees,
              walletProvider,
              wallet,
              route.params.to,
              nft.tokenId,
              AddressUtils.toEth(nft.contract),
              provider,
            );
          }
        }

        if (transaction) {
          EventTracker.instance.trackEvent(MarketingEvents.sendFund);

          navigation.navigate(TransactionStackRoutes.TransactionNftFinish, {
            fee: fee!,
            nft: route.params.nft,
            transaction,
            to: route.params.to,
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
          provider: Provider.selectedProvider.name,
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
  }, [navigation, nft, route.params.from, route.params.to, wallet, fee]);

  const onFeePress = useCallback(async () => {
    if (fee) {
      const result = await awaitForFee({
        fee,
        from: wallet?.address!,
        to: AddressUtils.toEth(nft.contract),
        data: feeData,
        chainId: nft.chain_id,
      });
      setFee(result);
    }
  }, [fee, wallet?.address, nft.contract, feeData]);

  const onPressToAddress = useCallback(() => {
    Clipboard.setString(route.params.to);
    sendNotification(I18N.notificationCopied);
  }, [route.params.to]);

  return (
    <TransactionNftConfirmation
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      item={route.params.nft}
      soulboundTokenHint={soulboundTokenHint}
      onFeePress={onFeePress}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
      onPressToAddress={onPressToAddress}
    />
  );
});
