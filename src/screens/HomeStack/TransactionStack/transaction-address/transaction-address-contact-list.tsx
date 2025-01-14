import {useMemo} from 'react';

import {observer} from 'mobx-react';

import {ListContact} from '@app/components/list-contact';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {AddressUtils} from '@app/helpers/address-utils';
import {withActionsContactItem} from '@app/hocs';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';

import {TransactionAddressAddContact} from './transaction-address-add-contact';
import {TransactionAddressContactListProps} from './transaction-address.types';

import {TransactionStore} from '../transaction-store';

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'transactionContactEdit',
});

export const TransactionAddressContactList = observer(
  ({onPress}: TransactionAddressContactListProps) => {
    const {toAddress, wallet} = TransactionStore;

    const filteredContacts = useMemo(() => {
      const contacts = Contact.getAll();

      if (!contacts?.length) {
        return [];
      }

      if (!toAddress) {
        return contacts.filter(
          c => !AddressUtils.equals(c.account, wallet.address),
        );
      }

      const lowerCaseAddress = toAddress.toLowerCase();

      return contacts.filter(c => {
        const hexAddress = AddressUtils.toEth(c.account);
        const haqqAddress = AddressUtils.toHaqq(hexAddress);

        return (
          (hexAddress.includes(lowerCaseAddress) ||
            haqqAddress.includes(lowerCaseAddress) ||
            c.name?.toLowerCase().includes(lowerCaseAddress)) &&
          !AddressUtils.equals(hexAddress, wallet.address)
        );
      });
    }, [toAddress, wallet.address]);

    if (!filteredContacts.length) {
      if (
        AddressUtils.isValidAddress(toAddress) &&
        !Wallet.getById(toAddress)
      ) {
        return <TransactionAddressAddContact address={toAddress} />;
      }

      return null;
    }

    return (
      <>
        <Spacer height={12} />
        <Text variant={TextVariant.t6} i18n={I18N.transactionMyContacts} />
        <ListOfContacts
          // FIXME please remove ts-ignore somehow
          // @ts-ignore
          data={filteredContacts}
          onPressAddress={onPress}
        />
      </>
    );
  },
);
