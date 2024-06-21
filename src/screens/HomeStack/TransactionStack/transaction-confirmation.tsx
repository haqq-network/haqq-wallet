import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {useError} from '@app/hooks/use-error';
import {Contact} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {getERC20TransferData} from '@app/services/eth-network/erc20';
import {EthSignErrorDataDetails} from '@app/services/eth-sign';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, ModalType} from '@app/types';
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
  const {token} = route.params;

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

  useLayoutEffectAsync(async () => {
    if (!Fee.calculatedFees) {
      let estimateFee;

      estimateFee = await EthNetwork.estimate({
        from,
        to,
        value,
        data,
      });

      Fee.setCalculatedFees(estimateFee);
    }
  }, [Fee.calculatedFees, from, to, value, data]);

  const onConfirmTransaction = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork();

        const provider = await getProviderInstanceForWallet(wallet, false);

        if (Fee.calculatedFees) {
          let transaction;
          if (token.is_erc20) {
            transaction = await ethNetworkProvider.transferERC20(
              Fee.calculatedFees,
              provider,
              wallet,
              route.params.to,
              route.params.amount,
              AddressUtils.toEth(token.id),
            );
          } else {
            transaction = await ethNetworkProvider.transferTransaction(
              Fee.calculatedFees,
              provider,
              wallet,
              route.params.to,
              route.params.amount,
            );
          }

          if (transaction) {
            EventTracker.instance.trackEvent(MarketingEvents.sendFund);

            navigation.navigate(TransactionStackRoutes.TransactionFinish, {
              transaction,
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
  }, [
    navigation,
    route.params.amount,
    route.params.from,
    route.params.to,
    wallet,
  ]);

  const onFeePress = useCallback(() => {
    navigation.navigate(TransactionStackRoutes.FeeSettings, {
      from,
      to,
      amount: value,
      data,
    });
  }, [navigation]);

  return (
    <TransactionConfirmation
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      amount={route.params.amount}
      onConfirmTransaction={onConfirmTransaction}
      onFeePress={onFeePress}
      testID="transaction_confirmation"
      token={route.params.token}
    />
  );
});
