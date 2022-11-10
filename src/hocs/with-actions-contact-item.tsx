import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Alert} from 'react-native';

import {
  ContactFlatListProps,
  ListContactProps,
} from '../components/list-contact';
import {useContacts} from '../contexts/contacts';
import {useTypedNavigation} from '../hooks/use-typed-navigation';
import {Contact} from '../models/contact';

interface settings {
  subscribeOnContacts?: boolean;
  screen?: string;
}

export interface ComponentProps extends Omit<ContactFlatListProps, 'data'> {
  filterText?: string;
}

export const withActionsContactItem = (
  Component: React.FC<ListContactProps>,
  {screen = 'settings', subscribeOnContacts = true}: settings,
) => {
  return ({filterText, ...props}: ComponentProps) => {
    const {navigate} = useTypedNavigation();
    const contacts = useContacts();

    const [contactsList, setContactsList] = useState(contacts.getContacts());

    useEffect(() => {
      if (subscribeOnContacts) {
        const callback = () => {
          setContactsList(contacts.getContacts());
        };
        contacts.on('contacts', callback);
        return () => {
          contacts.off('contacts', callback);
        };
      }
    }, [contacts]);

    const contactsFilteredList = useMemo(() => {
      if (filterText) {
        return contactsList.filter(
          (contact: Contact) =>
            !!`${contact.account} ${contact.name}`
              .toLowerCase()
              .match(filterText.toLowerCase()),
        );
      } else {
        return contactsList;
      }
    }, [contactsList, filterText]);

    const onPressEdit = useCallback(
      (item: Contact) => {
        const params = {
          name: item.name,
          address: item.account,
        };
        switch (screen) {
          case 'transaction':
            navigate('transactionEditContact', params);
            break;

          case 'settings':
            navigate('settingsEditContact', params);
            break;
        }
      },
      [navigate],
    );

    const onPressRemove = useCallback(
      (itemOrAddress: Contact | string) => {
        Alert.alert(
          'Delete Contact',
          'Are you sure you want to delete the selected contact?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const contactAddress =
                  typeof itemOrAddress === 'string'
                    ? itemOrAddress
                    : 'account' in itemOrAddress && itemOrAddress.account;
                contactAddress && contacts.removeContact(contactAddress);
              },
            },
          ],
        );
      },
      [contacts],
    );
    return (
      <Component
        data={contactsFilteredList}
        onPressRemove={onPressRemove}
        onPressEdit={onPressEdit}
        {...props}
      />
    );
  };
};
