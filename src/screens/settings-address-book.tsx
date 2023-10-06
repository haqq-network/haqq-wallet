import React, {useCallback, useEffect, useState} from 'react';

import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';

import {SettingsAddressBook} from '@app/components/settings-address-book';
import {awaitForScanQr} from '@app/helpers/await-for-scan-qr';
import {LinkType} from '@app/helpers/parse-deep-link';
import {useTypedNavigation} from '@app/hooks';
import {Contact} from '@app/models/contact';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {showUnrecognizedDataAttention} from '@app/utils';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen =
  ({}: SettingsAddressBookScreenProps) => {
    const [search, setSearch] = useState('');
    const [canAdd, setCanAdd] = useState(false);
    const {navigate} = useTypedNavigation();

    useEffect(() => {
      const add =
        search.length === 42 &&
        utils.isAddress(search.trim()) &&
        Contact.getById(search.trim()) === null;

      setCanAdd(add);
    }, [search]);

    const onPressQR = useCallback(async () => {
      const {type, params} = await awaitForScanQr();

      switch (type) {
        case LinkType.Haqq:
        case LinkType.Address:
        case LinkType.Etherium:
          setSearch(params.address ?? '');
          break;
        case LinkType.WalletConnect:
        case LinkType.Unrecognized:
          showUnrecognizedDataAttention();
          break;
      }
    }, []);

    const onPressClear = useCallback(() => {
      setSearch('');
    }, []);

    const onPressAdd = useCallback(() => {
      vibrate(HapticEffects.impactLight);
      navigate('settingsContactEdit', {
        name: '',
        address: search.trim(),
        isCreate: true,
      });
      setSearch('');
    }, [navigate, search]);

    const onPressAddress = useCallback(
      (address: string) => {
        vibrate(HapticEffects.impactLight);
        navigate('settingsContactEdit', {
          name: Contact.getById(address)?.name || '',
          address: address,
        });
      },
      [navigate],
    );

    return (
      <SettingsAddressBook
        onPressAdd={onPressAdd}
        onPressAddress={onPressAddress}
        onPressClear={onPressClear}
        onPressQR={onPressQR}
        canAdd={canAdd}
        search={search}
        setSearch={setSearch}
      />
    );
  };
