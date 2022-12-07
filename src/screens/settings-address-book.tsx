import React, {useCallback, useEffect, useState} from 'react';

import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';

import {SettingsAddressBook} from '@app/components/settings-address-book';
import {hideModal, showModal} from '@app/helpers/modal';
import {useApp, useContacts, useTypedNavigation} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen =
  ({}: SettingsAddressBookScreenProps) => {
    const app = useApp();

    const [search, setSearch] = useState('');
    const [canAdd, setCanAdd] = useState(false);
    const {navigate} = useTypedNavigation();
    const contacts = useContacts();

    useEffect(() => {
      const add =
        search.length === 42 &&
        utils.isAddress(search.trim()) &&
        contacts.getContact(search.trim()) === null;

      setCanAdd(add);
    }, [contacts, search]);

    const onPressQR = useCallback(() => {
      const subscription = ({to}: any) => {
        if (utils.isAddress(to)) {
          setSearch(to);
          app.off('address', subscription);
          hideModal();
        }
      };

      app.on('address', subscription);

      showModal('qr', {qrWithoutFrom: true});
    }, [app]);

    const onPressClear = useCallback(() => {
      setSearch('');
    }, []);

    const onPressAdd = useCallback(() => {
      navigate('settingsContactEdit', {
        name: '',
        address: search.trim(),
        isCreate: true,
      });
      setSearch('');
    }, [navigate, search]);

    const onPressAddress = useCallback(() => {
      vibrate(HapticEffects.impactLight);
    }, []);

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
