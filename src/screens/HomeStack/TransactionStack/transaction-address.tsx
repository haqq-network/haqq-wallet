import React, {useCallback, useMemo, useRef, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionAddress} from '@app/components/transaction-address';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';

const logger = Logger.create('TransactionAddressScreen');

export const TransactionAddressScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionAddress
  >();

  const [loading, setLoading] = React.useState(false);
  const wallets = Wallet.getAllVisible();
  const contacts = useRef(Contact.getAll()).current;

  const [address, setAddress] = useState(route.params?.to || '');
  const filteredWallets = useMemo(() => {
    if (!wallets || !wallets.length) {
      return [];
    }

    if (!address) {
      return wallets.filter(
        w => !AddressUtils.equals(w.address, route.params.from),
      );
    }

    const lowerCaseAddress = address.toLowerCase();

    return wallets.filter(
      w =>
        (w.address.toLowerCase().includes(lowerCaseAddress) ||
          w.cosmosAddress.toLowerCase().includes(lowerCaseAddress) ||
          w.name.toLowerCase().includes(lowerCaseAddress)) &&
        !AddressUtils.equals(w.address, route.params.from),
    );
  }, [address, wallets]);

  const filteredContacts = useMemo(() => {
    if (!contacts || !contacts.length) {
      return [];
    }

    if (!address) {
      return contacts.filter(
        c => !AddressUtils.equals(c.account, route.params.from),
      );
    }

    const lowerCaseAddress = address.toLowerCase();

    return contacts.filter(c => {
      const hexAddress = AddressUtils.toEth(c.account);
      const haqqAddress = AddressUtils.toHaqq(hexAddress);

      return (
        (hexAddress.includes(lowerCaseAddress) ||
          haqqAddress.includes(lowerCaseAddress) ||
          c.name?.toLowerCase().includes(lowerCaseAddress)) &&
        !AddressUtils.equals(hexAddress, route.params.from)
      );
    });
  }, [address, contacts]);

  const onDone = useCallback(
    async (result: string) => {
      try {
        setLoading(true);
        const nft = route.params.nft;
        if (nft) {
          navigation.navigate(
            TransactionStackRoutes.TransactionNftConfirmation,
            {
              from: AddressUtils.toEth(route.params.from),
              to: AddressUtils.toEth(result),
              nft,
            },
          );
        } else {
          navigation.navigate(TransactionStackRoutes.TransactionSelectCrypto, {
            from: AddressUtils.toEth(route.params.from),
            to: AddressUtils.toEth(result),
          });
        }
      } catch (e) {
        logger.error('onDone', e);
      } finally {
        setLoading(false);
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
      contacts={filteredContacts}
      onAddress={onDone}
      testID="transaction_address"
    />
  );
});
