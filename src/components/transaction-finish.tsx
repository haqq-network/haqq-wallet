import React, {useCallback, useMemo} from 'react';

import {View} from 'react-native';
import prompt from 'react-native-prompt-android';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {useContacts} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services/eth-network';
import {shortAddress} from '@app/utils';

const icon = require('../../assets/animations/transaction-finish.json');

type TransactionFinishProps = {
  transaction: Transaction | null;
  onSubmit: () => void;
};

export const TransactionFinish = ({
  transaction,
  onSubmit,
}: TransactionFinishProps) => {
  const contacts = useContacts();

  const short = useMemo(
    () => shortAddress(transaction?.to ?? ''),
    [transaction?.to],
  );

  const contact = useMemo(
    () => contacts.getContact(transaction?.to ?? ''),
    [contacts, transaction?.to],
  );

  const onPressContact = useCallback(() => {
    if (transaction?.to) {
      prompt(
        contact ? 'Edit contact' : 'Add contact',
        `Address: ${short}`,
        value => {
          if (contact) {
            contacts.updateContact(transaction.to, value);
          } else {
            contacts.createContact(transaction.to, value);
          }
        },
        {
          defaultValue: contact?.name ?? '',
          placeholder: 'Contact name',
        },
      );
    }
  }, [transaction?.to, contact, short, contacts]);

  const onPressHash = async () => {
    const url = `${EthNetwork.explorer}tx/${transaction?.hash}/internal-transactions`;
    await openURL(url);
  };

  return (
    <PopupContainer style={styles.container}>
      <View style={styles.sub}>
        <LottieWrap source={icon} style={styles.image} autoPlay loop={false} />
      </View>
      <Text
        t4
        i18n={I18N.transactionFinishSendingComplate}
        style={styles.title}
        center
        color={Color.textGreen1}
      />
      <Icon name="islm" i24 color={Color.graphicGreen1} style={styles.icon} />
      {transaction && (
        <Text t5 center style={styles.sum}>
          - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
        </Text>
      )}
      <Text t14 center style={styles.address}>
        {short}
      </Text>
      <Text
        t15
        center
        i18n={I18N.transactionFinishNetworkFee}
        i18params={{fee: `${transaction?.fee.toFixed(8)}`}}
        color={Color.textBase2}
      />
      <Spacer />
      <View style={styles.buttons}>
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
            t15
            center
            color={Color.textBase2}
          />
        </IconButton>
        <IconButton onPress={onPressHash} style={styles.button}>
          <Icon
            name="block"
            color={Color.graphicBase2}
            style={styles.buttonIcon}
            i24
          />
          <Text
            t15
            center
            i18n={I18N.transactionFinishHash}
            color={Color.textBase2}
          />
        </IconButton>
      </View>
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionFinishDone}
        onPress={onSubmit}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  sum: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 4,
  },
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
  margin: {marginBottom: 16},
});
