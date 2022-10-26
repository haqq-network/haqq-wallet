import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useContacts} from '../contexts/contacts';
import {Alert, FlatList, StyleSheet} from 'react-native';
import {AddressRow} from '../components/address-row';
import {AddressHeader} from '../components/address-header';
import {
  Box,
  CloseCircle,
  Container,
  IconButton,
  Text,
  PenIcon,
  PlusIcon,
  QRScanner,
  SwipeableRow,
  TrashIcon,
  TextField,
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
import prompt from 'react-native-prompt-android';
import {Contact} from '../models/contact';
import {AddressEmpty} from '../components/address-empty';

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
      const subscription = (value: string) => {
        if (utils.isAddress(value.trim())) {
          setSearch(value.trim());
          app.off('address', subscription);
          app.emit('modal', null);
        }
      };

      app.on('address', subscription);

      app.emit('modal', {type: 'qr'});
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
      <Container style={page.container}>
        <TextField
          label="Address"
          style={page.input}
          placeholder="Search or add a contact"
          value={search}
          onChangeText={setSearch}
          rightAction={
            search === '' ? (
              <IconButton onPress={onPressQR}>
                <QRScanner color={GRAPHIC_GREEN_1} style={page.icon} />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <CloseCircle color={GRAPHIC_BASE_2} style={page.icon} />
              </IconButton>
            )
          }
        />
        {canAdd && (
          <IconButton onPress={onPressAdd} style={page.addButton}>
            <Box style={page.badge}>
              <PlusIcon color={GRAPHIC_BASE_2} />
            </Box>
            <Text style={{color: TEXT_BASE_1}}>Add Contact</Text>
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
      </Container>
    );
  };

const page = StyleSheet.create({
  container: {
    marginVertical: 0,
    marginHorizontal: 0,
  },
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
