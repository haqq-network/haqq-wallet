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
  const [fee, setFee] = useState<CalculatedFees | null>(null);

  useLayoutEffectAsync(async () => {
    if (route.params.calculatedFees) {
      setFee(route.params.calculatedFees);
    } else {
      let estimateFee;

      if (token.is_erc20) {
        estimateFee = await EthNetwork.estimateERC20Transfer({
          from: wallet?.address!,
          to: route.params.to,
          amount: route.params.amount,
          contractAddress: AddressUtils.toEth(token.id),
        });
      } else {
        estimateFee = await EthNetwork.estimate({
          from: route.params.from,
          to: route.params.to,
          value: route.params.amount,
        });
      }

      setFee(estimateFee);
    }
  }, []);

  const onConfirmTransaction = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork();

        const provider = await getProviderInstanceForWallet(wallet, false);

        if (fee) {
          let transaction;
          if (token.is_erc20) {
            transaction = await ethNetworkProvider.transferERC20(
              fee,
              provider,
              wallet,
              route.params.to,
              route.params.amount,
              AddressUtils.toEth(token.id),
            );
          } else {
            transaction = await ethNetworkProvider.transferTransaction(
              fee,
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
              fee,
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
    fee,
    navigation,
    route.params.amount,
    route.params.from,
    route.params.to,
    wallet,
  ]);

  const onFeePress = useCallback(() => {
    const {from, to, amount} = route.params;
    navigation.navigate(TransactionStackRoutes.FeeSettings, {
      from,
      to,
      amount,
      token: route.params.token,
    });
  }, [fee, navigation]);

  return (
    <TransactionConfirmation
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      amount={route.params.amount}
      fee={fee?.expectedFee}
      onConfirmTransaction={onConfirmTransaction}
      onFeePress={onFeePress}
      testID="transaction_confirmation"
      token={route.params.token}
    />
  );
});
