import React, {useCallback, useMemo, useRef, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionAddress} from '@app/components/transaction-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';
import {isHaqqAddress} from '@app/utils';

export const TransactionAddressScreen = observer(() => {
  const navigation = useTypedNavigation();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<'transactionAddress'>();

  const [loading, setLoading] = React.useState(false);
  const wallets = Wallet.getAllVisible();
  const contacts = useRef(Contact.getAll()).current;

  const [address, setAddress] = useState(route.params?.to || '');
  const filteredWallets = useMemo(() => {
    if (!wallets || !wallets.length) {
      return;
    }

    if (!address) {
      return wallets;
    }

    const lowerCaseAddress = address.toLowerCase();
    return wallets.filter(
      w =>
        w.address.toLowerCase().includes(lowerCaseAddress) ||
        w.cosmosAddress.toLowerCase().includes(lowerCaseAddress) ||
        w.name.toLowerCase().includes(lowerCaseAddress),
    );
  }, [address, wallets]);

  const onDone = useCallback(
    async (result: string) => {
      const nft = route.params.nft;
      result = isHaqqAddress(result) ? Cosmos.bech32ToAddress(result) : result;
      if (nft) {
        try {
          setLoading(true);
          //TODO:
          // const balance = await EthNetwork.getBalance(route.params.from);
          // const fee = await EthNetwork.estimateTransaction(
          //   route.params.from,
          //   address,
          //   balance,
          // );
          const fee = 1;
          navigation.navigate('transactionNftConfirmation', {
            from: route.params.from,
            to: result,
            nft,
            fee,
          });
        } catch (e) {
          setLoading(false);
        }
      } else {
        navigation.navigate('transactionSelectCrypto', {
          from: route.params.from,
          to: result,
        });
      }
    },
    [navigation, route],
  );

  return (
    <TransactionAddress
      loading={loading}
      address={address}
      setAddress={setAddress}
      filteredWallets={filteredWallets}
      contacts={contacts}
      onAddress={onDone}
      testID="transaction_address"
    />
  );
});
