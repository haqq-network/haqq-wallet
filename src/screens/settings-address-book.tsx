import React, {useCallback, useEffect, useState} from 'react';

import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {StyleSheet} from 'react-native';

import {useApp, useContacts} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {AddressEmpty} from '../components/address-empty';
import {AddressHeader} from '../components/address-header';
import {ListContact} from '../components/list-contact';
import {
  Box,
  Icon,
  IconButton,
  QRScanner,
  Text,
  TextField,
} from '../components/ui';
import {hideModal, showModal} from '../helpers/modal';
import {withActionsContactItem} from '../hocs';
import {useTypedNavigation} from '../hooks';
import {
  LIGHT_GRAPHIC_BASE_2,
  LIGHT_GRAPHIC_GREEN_1,
  LIGHT_TEXT_BASE_1,
} from '../variables';

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'settingsContactEdit',
});

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
      <>
        <TextField
          label="Address"
          style={page.input}
          placeholder="Search or add a contact"
          value={search}
          onChangeText={setSearch}
          multiline
          autoFocus
          rightAction={
            search === '' ? (
              <IconButton onPress={onPressQR}>
                <QRScanner color={LIGHT_GRAPHIC_GREEN_1} style={page.icon} />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <Icon s name="close_circle" color={LIGHT_GRAPHIC_BASE_2} />
              </IconButton>
            )
          }
        />

        {canAdd && (
          <IconButton onPress={onPressAdd} style={page.addButton}>
            <Box style={page.badge}>
              <Icon s name="plus_mid" color={LIGHT_GRAPHIC_BASE_2} />
            </Box>
            <Text color={LIGHT_TEXT_BASE_1}>Add Contact</Text>
          </IconButton>
        )}
        <ListOfContacts
          ListHeaderComponent={AddressHeader}
          ListEmptyComponent={AddressEmpty}
          contentContainerStyle={page.grow}
          onPressAddress={onPressAddress}
          filterText={search}
        />
      </>
    );
  };

const page = StyleSheet.create({
  input: {
    marginBottom: 12,
    marginHorizontal: 20,
  },
  icon: {width: 20, height: 20},
  badge: {
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  grow: {flexGrow: 1},
});
