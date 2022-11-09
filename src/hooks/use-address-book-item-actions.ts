import {useCallback, useEffect, useState} from 'react';
import {useContacts} from '../contexts/contacts';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Contact} from '../models/contact';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';

export const useAddressBookItemActions = (
  subscribe?: boolean,
  isTransactions?: boolean,
) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const contacts = useContacts();

  const [contactsList, setContactsList] = useState(contacts.getContacts());

  useEffect(() => {
    if (subscribe) {
      const callback = () => {
        setContactsList(contacts.getContacts());
      };

      contacts.on('contacts', callback);

      return () => {
        contacts.off('contacts', callback);
      };
    }
  }, [contacts, subscribe]);

  const onPressEdit = useCallback(
    (item: Contact) => {
      if (isTransactions) {
        navigation.navigate('transactionEditContact', {
          name: item.name,
          address: item.account,
        });
      } else {
        navigation.navigate('settingsEditContact', {
          name: item.name,
          address: item.account,
        });
      }
    },
    [navigation, isTransactions],
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
  return {contactsList, contacts, navigation, onPressEdit, onPressRemove};
};
