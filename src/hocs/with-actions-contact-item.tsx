import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Alert} from 'react-native';

import {
  ContactFlatListProps,
  ListContactProps,
} from '@app/components/list-contact';
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

    const [contactsList, setContactsList] = useState(
      Contact.getAll().snapshot(),
    );

    useEffect(() => {
      if (subscribeOnContacts) {
        const contacts = Contact.getAll();
        const callback = () => {
          setContactsList(contacts.snapshot());
        };

        contacts.addListener(callback);
        return () => {
          contacts.removeListener(callback);
        };
      }
    }, []);

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

    const onPressRemove = useCallback((itemOrAddress: Contact | string) => {
      const alertTitle = getText(I18N.settingsAddressBookAlertTitle);
      const alertDesc = getText(I18N.settingsAddressBookAlertDesc);
      const alertBtnFirst = getText(I18N.settingsAddressBookAlertBtnFirst);
      const alertBtnSecond = getText(I18N.settingsAddressBookAlertBtnSecond);
      Alert.alert(alertTitle, alertDesc, [
        {text: alertBtnFirst, style: 'cancel'},
        {
          text: alertBtnSecond,
          style: 'destructive',
          onPress: () => {
            const contactAddress =
              typeof itemOrAddress === 'string'
                ? itemOrAddress
                : 'account' in itemOrAddress && itemOrAddress.account;
            contactAddress && Contact.remove(contactAddress);
          },
        },
      ]);
    }, []);
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
