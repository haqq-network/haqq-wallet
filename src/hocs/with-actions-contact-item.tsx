import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Alert} from 'react-native';

import {
  ContactFlatListProps,
  ListContactProps,
} from '@app/components/list-contact';
import {useContacts} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';

interface settings {
  subscribeOnContacts?: boolean;
  nextScreen?: 'transactionContactEdit' | 'settingsContactEdit';
}

export interface ComponentProps extends Omit<ContactFlatListProps, 'data'> {
  filterText?: string;
  onPressAddress?: (item: string) => void;
}

export const withActionsContactItem = (
  Component: React.FC<ListContactProps>,
  {nextScreen = 'settingsContactEdit', subscribeOnContacts = true}: settings,
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
        navigate(nextScreen, params);
      },
      [navigate],
    );

    const onPressRemove = useCallback(
      (itemOrAddress: Contact | string) => {
        const AlertTitle = getText(I18N.settingsAddressBookAlertTitle);
        const AlertDesc = getText(I18N.settingsAddressBookAlertDesc);
        const AlertBtnFirst = getText(I18N.settingsAddressBookAlertBtnFirst);
        const AlertBtnSecond = getText(I18N.settingsAddressBookAlertBtnSecond);
        Alert.alert(AlertTitle, AlertDesc, [
          {text: AlertBtnFirst, style: 'cancel'},
          {
            text: AlertBtnSecond,
            style: 'destructive',
            onPress: () => {
              const contactAddress =
                typeof itemOrAddress === 'string'
                  ? itemOrAddress
                  : 'account' in itemOrAddress && itemOrAddress.account;
              contactAddress && contacts.removeContact(contactAddress);
            },
          },
        ]);
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
