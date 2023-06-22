import React, {useCallback, useRef} from 'react';

import {TransactionAddress} from '@app/components/transaction-address';
import {useTypedNavigation, useTypedRoute, useWalletsVisible} from '@app/hooks';
import {Contact} from '@app/models/contact';

export const TransactionAddressScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionAddress'>();

  const [loading, setLoading] = React.useState(false);
  const wallets = useWalletsVisible();
  const contacts = useRef(Contact.getAll().snapshot()).current;

  const onDone = useCallback(
    async (address: string) => {
      const nft = route.params.nft;
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
            to: address,
            nft,
            fee,
          });
        } catch (e) {
          setLoading(false);
        }
      } else {
        navigation.navigate('transactionSum', {
          from: route.params.from,
          to: address,
        });
      }
    },
    [navigation, route],
  );

  return (
    <TransactionAddress
      initial={route.params?.to}
      loading={loading}
      wallets={wallets}
      contacts={contacts}
      onAddress={onDone}
    />
  );
};
