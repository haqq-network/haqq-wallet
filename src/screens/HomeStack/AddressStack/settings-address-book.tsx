import React, {memo, useCallback, useEffect, useState} from 'react';

import {CompositeScreenProps} from '@react-navigation/native';

import {SettingsAddressBook} from '@app/components/settings-address-book';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForScanQr} from '@app/helpers/await-for-scan-qr';
import {LinkType, parseDeepLink} from '@app/helpers/parse-deep-link';
import {useTypedNavigation} from '@app/hooks';
import {Contact} from '@app/models/contact';
import {
  AddressBookParamList,
  AddressBookStackRoutes,
} from '@app/screens/HomeStack/AddressStack';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {showUnrecognizedDataAttention} from '@app/utils';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen = memo(
  ({}: SettingsAddressBookScreenProps) => {
    const [search, setSearch] = useState('');
    const [canAdd, setCanAdd] = useState(false);
    const {navigate} = useTypedNavigation<AddressBookParamList>();

    useEffect(() => {
      const add =
        search.length === 42 &&
        AddressUtils.isEthAddress(search.trim()) &&
        Contact.getById(search.trim()) === null;

      setCanAdd(add);
    }, [search]);

    const onPressQR = useCallback(async () => {
      const data = await awaitForScanQr();
      const {type, params} = await parseDeepLink(data);

      switch (type) {
        case LinkType.Haqq:
        case LinkType.Address:
        case LinkType.Etherium:
          setSearch(params.address ?? '');
          break;
        default:
          showUnrecognizedDataAttention();
          break;
      }
    }, []);

    const onPressClear = useCallback(() => {
      setSearch('');
    }, []);

    const onPressAdd = useCallback(() => {
      vibrate(HapticEffects.impactLight);
      navigate(AddressBookStackRoutes.SettingsContactEdit, {
        name: '',
        address: search.trim(),
        isCreate: true,
      });
      setSearch('');
    }, [navigate, search]);

    const onPressAddress = useCallback(
      (address: string) => {
        vibrate(HapticEffects.impactLight);
        navigate(AddressBookStackRoutes.SettingsContactEdit, {
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
  },
);
