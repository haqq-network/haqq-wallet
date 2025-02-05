import {useCallback} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';
import prompt from 'react-native-prompt-android';

import {Color} from '@app/colors';
import {
  Icon,
  IconButton,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Contact, ContactType} from '@app/models/contact';
import {Provider} from '@app/models/provider';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {sendNotification} from '@app/services';

import {TransactionStore} from '../transaction-store';

export const TransactionResultInfoButtons = observer(() => {
  const {fromChainId, toAddress} = TransactionStore;
  const {transaction} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionResult
  >().params;
  const contact = Contact.getById(toAddress);

  const onPressContact = useCallback(() => {
    if (toAddress) {
      prompt(
        getText(
          contact
            ? I18N.transactionFinishEditContact
            : I18N.transactionFinishAddContact,
        ),
        getText(I18N.transactionFinishContactMessage, {
          address: toAddress,
        }),
        value => {
          if (contact) {
            Contact.update(contact.account, {
              name: value,
            });
            sendNotification(I18N.transactionFinishContactUpdated);
          } else {
            Contact.create(toAddress, {
              name: value,
              type: ContactType.address,
              visible: true,
            });
            sendNotification(I18N.transactionFinishContactAdded);
          }
        },
        {
          defaultValue: contact?.name ?? '',
          placeholder: getText(I18N.transactionFinishContactMessagePlaceholder),
        },
      );
    }
  }, [toAddress, contact]);

  const onPressHash = useCallback(async () => {
    const provider =
      Provider.getByEthChainId(fromChainId!) || Provider.selectedProvider;
    const url = provider.getTxExplorerUrl(transaction?.hash!);
    await openURL(url);
  }, []);

  return (
    <View style={styles.buttons}>
      {!contact && (
        <IconButton onPress={onPressContact} style={styles.button}>
          {contact ? (
            <Icon
              name="pen"
              i24
              color={Color.graphicBase2}
              style={styles.buttonIcon}
            />
          ) : (
            <Icon
              name="user"
              i24
              color={Color.graphicBase2}
              style={styles.buttonIcon}
            />
          )}
          <Text
            i18n={
              contact
                ? I18N.transactionFinishEditContact
                : I18N.transactionFinishAddContact
            }
            variant={TextVariant.t15}
            position={TextPosition.center}
            color={Color.textBase2}
          />
        </IconButton>
      )}
      <IconButton onPress={onPressHash} style={styles.button}>
        <Icon
          name="block"
          color={Color.graphicBase2}
          style={styles.buttonIcon}
          i24
        />
        <Text
          variant={TextVariant.t15}
          position={TextPosition.center}
          i18n={I18N.transactionFinishHash}
          color={Color.textBase2}
        />
      </IconButton>
    </View>
  );
});

const styles = createTheme({
  buttons: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 28,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
});
