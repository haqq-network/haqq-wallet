import React, {useCallback} from 'react';

import {TransactionAddress} from '@app/components/transaction-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const TransactionAddressScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionAddress'>();

  const [loading, setLoading] = React.useState(false);

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
      onAddress={onDone}
    />
  );
};
