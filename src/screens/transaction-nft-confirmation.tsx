import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionNftConfirmation} from '@app/components/transaction-nft-confirmation';
import {abortProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';

// TODO:
export const TransactionNftConfirmationScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionNftConfirmation'>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const wallet = useWallet(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disabled, setDisabled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fee, setFee] = useState(route.params.fee ?? 0);

  useEffect(() => {
    // EthNetwork.estimateTransaction(
    //   route.params.from,
    //   route.params.to,
    //   route.params.amount,
    // ).then(result => setFee(result.fee));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDoneLedgerBt = useCallback(() => {
    //   navigation.navigate('transactionLedger', {
    //     from: route.params.from,
    //     to: route.params.to,
    //     amount: route.params.amount,
    //     fee: fee,
  }, []);

  const onConfirmTransaction = useCallback(async () => {
    const hash =
      '0x9915496c761b2ac2dd906d739be0d2228b801caa30243b28ba41875405e6ff80';
    navigation.navigate('transactionNftFinish', {
      hash,
      nft: route.params.nft,
    });
    // if (wallet) {
    //   if (wallet.type === WalletType.ledgerBt) {
    //     onDoneLedgerBt();
    //     return;
    //   }
    //   try {
    //     setDisabled(true);
    //     const ethNetworkProvider = new EthNetwork();
    //     const provider = await getProviderInstanceForWallet(wallet);
    //     const transaction = await ethNetworkProvider.sendTransaction(
    //       provider,
    //       wallet.path!,
    //       route.params.to,
    //       new Decimal(route.params.amount).mul(WEI).toFixed(),
    //     );
    //     if (transaction) {
    //       onTrackEvent(AdjustEvents.sendFund);
    //       await awaitForEventDone(
    //         Events.onTransactionCreate,
    //         transaction,
    //         user.providerId,
    //         fee,
    //       );
    //       navigation.navigate('transactionFinish', {
    //         hash: transaction.hash,
    //       });
    //     }
    //   } catch (e) {
    //     const errorId = makeID(4);
    //     captureException(e, 'transaction-confirmation', {
    //       from: route.params.from,
    //       to: route.params.to,
    //       amount: route.params.amount,
    //       id: errorId,
    //       walletType: wallet.type,
    //     });
    //     if (e instanceof Error) {
    //       setError(
    //         getText(I18N.transactionFailed, {
    //           id: errorId,
    //         }),
    //       );
    //     }
    //   } finally {
    //     setDisabled(false);
    //   }
    // }
  }, [navigation, route.params.nft]);

  useEffect(() => {
    return () => {
      wallet && wallet.isValid() && abortProviderInstanceForWallet(wallet);
    };
  }, [wallet]);

  return (
    <TransactionNftConfirmation
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      item={route.params.nft}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
      error={error}
    />
  );
};
