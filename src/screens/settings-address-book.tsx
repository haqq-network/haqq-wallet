import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {AddressRow} from '../components/address-row';
import {AddressHeader} from '../components/address-header';
import {
  Box,
  Icon,
  IconButton,
  PenIcon,
  PopupContainer,
  QRScanner,
  SwipeableRow,
  Text,
  TextField,
  TrashIcon,
} from '../components/ui';
import {
  GRAPHIC_BASE_2,
  GRAPHIC_BASE_3,
  GRAPHIC_GREEN_1,
  GRAPHIC_RED_1,
  GRAPHIC_SECOND_4,
  TEXT_BASE_1,
} from '../variables';
import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {useApp} from '../contexts/app';
import {Contact} from '../models/contact';
import {AddressEmpty} from '../components/address-empty';
import {hideModal, showModal} from '../helpers/modal';
import {useAddressBookItemActions} from '../hooks/use-address-book-item-actions';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen =
  ({}: SettingsAddressBookScreenProps) => {
    const app = useApp();
    const {contactsList, onPressEdit, onPressRemove, navigation, contacts} =
      useAddressBookItemActions(true);

    const [search, setSearch] = useState('');
    const [canAdd, setCanAdd] = useState(false);

    const contactsFilteredList = useMemo(
      () =>
        contactsList.filter(
          (contact: Contact) =>
            !!`${contact.account} ${contact.name}`
              .toLowerCase()
              .match(search.toLowerCase()),
        ),
      [contactsList, search],
    );

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
      navigation.navigate('settingsEditContact', {
        name: '',
        address: search.trim(),
        isCreate: true,
      });
      setSearch('');
    }, [navigation, search]);

    return (
      <PopupContainer>
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
                <QRScanner color={GRAPHIC_GREEN_1} style={page.icon} />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <Icon s name="closeCircle" color={GRAPHIC_BASE_2} />
              </IconButton>
            )
          }
        />

        {canAdd && (
          <IconButton onPress={onPressAdd} style={page.addButton}>
            <Box style={page.badge}>
              <Icon s name="plusMid" color={GRAPHIC_BASE_2} />
            </Box>
            <Text style={{color: TEXT_BASE_1}}>Add Contact</Text>
          </IconButton>
        )}
        <FlatList
          // scrollEnabled={false}
          data={contactsFilteredList}
          renderItem={({item}) => (
            <SwipeableRow
              item={item}
              rightActions={[
                {
                  icon: <PenIcon color={GRAPHIC_BASE_3} />,
                  backgroundColor: GRAPHIC_SECOND_4,
                  onPress: onPressEdit,
                  key: 'edit',
                },
                {
                  icon: <TrashIcon color={GRAPHIC_BASE_3} />,
                  backgroundColor: GRAPHIC_RED_1,
                  onPress: onPressRemove,
                  key: 'remove',
                },
              ]}>
              <AddressRow item={item} onPress={() => {}} />
            </SwipeableRow>
          )}
          ListHeaderComponent={AddressHeader}
          ListEmptyComponent={AddressEmpty}
          contentContainerStyle={page.grow}
        />
      </PopupContainer>
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
