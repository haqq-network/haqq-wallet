import {ListContact} from '@app/components/list-contact';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {withActionsContactItem} from '@app/hocs';
import {I18N} from '@app/i18n';

import {TransactionAddressContactListProps} from './transaction-address.types';

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'transactionContactEdit',
});

export const TransactionAddressContactList = ({
  contacts,
  onPress,
}: TransactionAddressContactListProps) => {
  return (
    <>
      <Spacer height={12} />
      <Text variant={TextVariant.t6} i18n={I18N.transactionMyContacts} />
      <ListOfContacts
        // @ts-ignore
        data={contacts}
        onPressAddress={onPress}
      />
    </>
  );
};
