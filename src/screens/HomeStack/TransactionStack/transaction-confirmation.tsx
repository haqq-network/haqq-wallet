import {useCallback, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {observer} from 'mobx-react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForFee} from '@app/helpers/await-for-fee';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useError} from '@app/hooks/use-error';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork, sendNotification} from '@app/services';
import {Balance} from '@app/services/balance';
import {getERC20TransferData} from '@app/services/eth-network/erc20';
import {EthSignErrorDataDetails} from '@app/services/eth-sign';
import {EventTracker} from '@app/services/event-tracker';
import {AddressEthereum, MarketingEvents, ModalType} from '@app/types';
import {makeID} from '@app/utils';

export const TransactionConfirmationScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionConfirmation
  >();
  const {token, calculatedFees} = route.params;
  const visible = Wallet.getAllVisible();
  const balance = Wallet.getBalancesByAddressList(visible);

  const [fee, setFee] = useState<Fee>(new Fee(calculatedFees!));

  const wallet = Wallet.getById(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );
  const showError = useError();
  const [disabled, setDisabled] = useState(false);

  const {from, to, value, data} = useMemo(() => {
    const contractAddress = AddressUtils.toEth(token.id);

    return {
      from: token.is_erc20 ? wallet?.address! : route.params.from,
      to: token.is_erc20 ? contractAddress : route.params.to,
      value: token.is_erc20 ? undefined : route.params.amount,
      data: token.is_erc20
        ? getERC20TransferData(
            route.params.to,
            route.params.amount,
            contractAddress,
          )
        : undefined,
    };
  }, [token, wallet?.address, route.params]);

  const onConfirmTransaction = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork();

        const provider = await getProviderInstanceForWallet(wallet, false);

        if (fee?.calculatedFees) {
          let transaction;
          if (token.is_erc20) {
            transaction = await ethNetworkProvider.transferERC20(
              fee.calculatedFees,
              provider,
              wallet,
              route.params.to,
              route.params.amount,
              AddressUtils.toEth(token.id),
              Provider.getByEthChainId(token.chain_id),
            );
          } else {
            transaction = await ethNetworkProvider.transferTransaction(
              fee.calculatedFees,
              provider,
              wallet,
              route.params.to,
              route.params.amount,
              Provider.getByEthChainId(token.chain_id),
            );
          }

          if (transaction) {
            EventTracker.instance.trackEvent(MarketingEvents.sendFund);

            navigation.navigate(TransactionStackRoutes.TransactionFinish, {
              fee,
              transaction,
              to: route.params.to,
              hash: transaction.hash,
              token: route.params.token,
              amount: token.is_erc20 ? route.params.amount : undefined,
            });
          }
        }
      } catch (e) {
        const errorId = makeID(4);

        Logger.captureException(e, 'transaction-confirmation', {
          from: route.params.from,
          to: route.params.to,
          amount: route.params.amount.toHex(),
          id: errorId,
          walletType: wallet.type,
          token,
          contact,
          provider: Provider.getByEthChainId(token.chain_id)?.name,
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
            currentAmount: Wallet.getBalance(wallet!.address, 'available'),
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
  }, [
    navigation,
    route.params.amount,
    route.params.from,
    route.params.to,
    wallet,
    fee,
  ]);

  const onFeePress = useCallback(async () => {
    if (fee) {
      const result = await awaitForFee({
        fee,
        from,
        to,
        value,
        data,
        chainId: token.chain_id,
      });

      setFee(result);
    }
  }, [fee, from, to, value, data]);

  const onPressToAddress = useCallback(() => {
    Clipboard.setString(route.params.to);
    sendNotification(I18N.notificationCopied);
  }, [route.params.to]);

  return (
    <TransactionConfirmation
      balance={balance[route.params.from as AddressEthereum]}
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      amount={route.params.amount}
      onConfirmTransaction={onConfirmTransaction}
      onFeePress={onFeePress}
      onPressToAddress={onPressToAddress}
      fee={fee}
      testID="transaction_confirmation"
      token={route.params.token}
    />
  );
});
