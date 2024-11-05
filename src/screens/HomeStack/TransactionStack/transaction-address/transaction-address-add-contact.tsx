import {useCallback} from 'react';

import {View} from 'react-native';
import prompt from 'react-native-prompt-android';

import {Color} from '@app/colors';
import {
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Contact, ContactType} from '@app/models/contact';
import {sendNotification} from '@app/services';

import {TransactionAddressAddContactProps} from './transaction-address.types';

export const TransactionAddressAddContact = ({
  address,
}: TransactionAddressAddContactProps) => {
  const onPress = useCallback(() => {
    prompt(
      getText(I18N.transactionFinishAddContact),
      getText(I18N.transactionFinishContactMessage, {
        address,
      }),
      value => {
        Contact.create(address, {
          name: value,
          type: ContactType.address,
          visible: true,
        });
        sendNotification(I18N.transactionFinishContactAdded);
      },
      {
        defaultValue: '',
        placeholder: getText(I18N.transactionFinishContactMessagePlaceholder),
      },
    );
  }, [address]);
  return (
    <View style={styles.container}>
      <IconButton style={styles.iconButton} onPress={onPress}>
        <Icon i24 name={IconsName.plus_mid} color={Color.graphicBase2} />
      </IconButton>
      <Spacer width={12} />
      <Text variant={TextVariant.t11} i18n={I18N.settingsAddressBookAdd} />
    </View>
  );
};

const styles = createTheme({
  container: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Color.bg8,
  },
});
