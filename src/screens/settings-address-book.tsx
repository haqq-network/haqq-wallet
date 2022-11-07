import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {Alert, FlatList} from 'react-native';
import prompt from 'react-native-prompt-android';

import {Color, getColor} from '../colors';
import {AddressEmpty} from '../components/address-empty';
import {AddressHeader} from '../components/address-header';
import {AddressRow} from '../components/address-row';
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
import {useApp} from '../contexts/app';
import {useContacts} from '../contexts/contacts';
import {createTheme} from '../helpers/create-theme';
import {hideModal, showModal} from '../helpers/modal';
import {Contact} from '../models/contact';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen =
  ({}: SettingsAddressBookScreenProps) => {
    const app = useApp();
    const contacts = useContacts();
    const [search, setSearch] = useState('');
    const [canAdd, setCanAdd] = useState(false);

    const [rows, setRows] = useState(contacts.getContacts());

    useEffect(() => {
      const callback = () => {
        setRows(contacts.getContacts());
      };

      contacts.on('contacts', callback);

      return () => {
        contacts.off('contacts', callback);
      };
    }, [contacts]);

    const contactsList = useMemo(
      () =>
        rows.filter(
          (contact: Contact) =>
            !!`${contact.account} ${contact.name}`
              .toLowerCase()
              .match(search.toLowerCase()),
        ),
      [rows, search],
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
      prompt(
        'Add contact',
        `Address: ${search}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add',
            onPress: value => {
              contacts.createContact(search.trim(), value);
              setSearch('');
            },
          },
        ],
        {
          placeholder: 'Contact name',
        },
      );
    }, [contacts, search]);

    const onPressEdit = useCallback(
      (item: Contact) => {
        prompt(
          'Edit contact',
          `Address: ${item.account}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Save',
              onPress: value => {
                contacts.updateContact(item.account, value);
              },
            },
          ],
          {
            defaultValue: item?.name ?? '',
            placeholder: 'Contact name',
          },
        );
      },
      [contacts],
    );

    const onPressRemove = useCallback(
      (item: Contact) => {
        Alert.alert(
          'Delete Contact',
          'Are you sure you want to delete the selected contact?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                contacts.removeContact(item.account);
              },
            },
          ],
        );
      },
      [contacts],
    );

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
                <QRScanner
                  color={getColor(Color.graphicGreen1)}
                  style={page.icon}
                />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <Icon
                  s
                  name="closeCircle"
                  color={getColor(Color.graphicBase2)}
                />
              </IconButton>
            )
          }
        />

        {canAdd && (
          <IconButton onPress={onPressAdd} style={page.addButton}>
            <Box style={page.badge}>
              <Icon s name="plusMid" color={getColor(Color.graphicBase2)} />
            </Box>
            <Text t11 style={page.addContact}>
              Add Contact
            </Text>
          </IconButton>
        )}
        <FlatList
          // scrollEnabled={false}
          data={contactsList}
          renderItem={({item}) => (
            <SwipeableRow
              item={item}
              rightActions={[
                {
                  icon: <PenIcon color={getColor(Color.graphicBase3)} />,
                  backgroundColor: Color.graphicSecond4,
                  onPress: onPressEdit,
                  key: 'edit',
                },
                {
                  icon: <TrashIcon color={getColor(Color.graphicBase3)} />,
                  backgroundColor: Color.graphicRed1,
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

const page = createTheme({
  input: {
    marginBottom: 12,
    marginHorizontal: 20,
  },
  icon: {
    width: 20,
    height: 20,
  },
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
  addContact: {
    color: Color.textBase1,
  },
  clear: {
    width: 24,
    height: 24,
    tintColor: Color.graphicBase2,
  },
  plusMid: {
    tintColor: Color.graphicBase2,
    width: 24,
    height: 24,
  },
});
