import React from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  LottieWrap,
  NetworkFee,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services/eth-network';
import {cleanNumber} from '@app/utils';
import {WEI} from '@app/variables/common';

const icon = require('../../assets/animations/transaction-finish.json');

type TransactionFinishProps = {
  transaction: Transaction | null;
  onSubmit: () => void;
  onPressContact: () => void;
  contact: Contact | null;
  short: string;
};

export const TransactionFinish = ({
  transaction,
  onSubmit,
  onPressContact,
  contact,
  short,
}: TransactionFinishProps) => {
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
        i18n={I18N.transactionFinishSendingComplete}
        style={styles.title}
        center
        color={Color.textGreen1}
      />
      <Image
        source={require('../../assets/images/islm_icon.png')}
        style={styles.icon}
      />
      {transaction && (
        <Text t5 center style={styles.sum}>
          - {cleanNumber((transaction?.value).toFixed(8))} ISLM
        </Text>
      )}

      <View style={styles.contactLine}>
        {contact?.name && (
          <Text t13 center style={styles.address}>
            {contact.name + ' '}
          </Text>
        )}
        <Text t14 center style={styles.address}>
          {short}
        </Text>
      </View>

      <NetworkFee fee={(transaction?.fee ?? 0) * WEI} />

      <View style={styles.providerContainer}>
        <Text
          t14
          color={Color.textBase2}
          i18n={I18N.transactionConfirmationHAQQ}
        />
        <Text
          t14
          color={Color.textBase2}
          i18n={I18N.transactionConfirmationHQ}
        />
      </View>

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
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
  },
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
  contactLine: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  providerContainer: {
    backgroundColor: Color.bg8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
});
