import React, {useCallback, useEffect, useState} from 'react';

import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';

import {SettingsAddressBook} from '@app/components/settings-address-book';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers/modal';
import {useTypedNavigation} from '@app/hooks';
import {Contact} from '@app/models/contact';
import {HapticEffects, vibrate} from '@app/services/haptic';

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

    const onPressQR = useCallback(() => {
      const subscription = ({to}: any) => {
        if (utils.isAddress(to)) {
          setSearch(to);
          app.off('address', subscription);
          hideModal('qr');
        }
      };

      app.on('address', subscription);

      showModal('qr', {qrWithoutFrom: true});
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
