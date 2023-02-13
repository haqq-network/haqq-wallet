import React, {useMemo} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  ErrorText,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {splitAddress} from '@app/utils';
import {WEI} from '@app/variables/common';

interface TransactionConfirmationProps {
  to: string;
  amount: number;
  fee: number;
  contact: Contact | null;
  error?: string;

  disabled?: boolean;
  onConfirmTransaction: () => void;
}

export const TransactionConfirmation = ({
  error,
  disabled,
  contact,
  to,
  amount,
  fee,
  onConfirmTransaction,
}: TransactionConfirmationProps) => {
  const splittedTo = useMemo(() => splitAddress(to), [to]);

  return (
    <PopupContainer style={styles.container}>
      <Image
        source={require('@assets/images/islm_icon.png')}
        style={styles.icon}
      />
      <Text
        t11
        color={Color.textBase2}
        center
        style={styles.subtitle}
        i18n={I18N.transactionConfirmationTotalAmount}
      />
      <Text
        t11
        color={Color.textBase1}
        center
        style={styles.sum}
        i18n={I18N.transactionConfirmationSum}
        i18params={{sum: `${+(amount + fee).toFixed(8)}`}}
      />
      <Text
        t11
        color={Color.textBase2}
        center
        style={styles.subtitle}
        i18n={I18N.transactionConfirmationSendTo}
      />
      {contact && (
        <Text t11 color={Color.textBase1} center style={styles.contact}>
          {contact.name}
        </Text>
      )}
      <Text t11 color={Color.textBase1} center style={styles.address}>
        <Text t11 color={Color.textBase1} center style={styles.address}>
          {splittedTo[0]}
        </Text>
        <Text t11 color={Color.textBase2}>
          {splittedTo[1]}
        </Text>
        <Text t11>{splittedTo[2]}</Text>
      </Text>
      <Spacer style={styles.spacer}>
        <View style={styles.info}>
          <DataView label="Cryptocurrency">
            <Text t11 color={Color.textBase1}>
              <Text i18n={I18N.transactionConfirmationIslamicCoin} />{' '}
              <Text
                color={Color.textBase2}
                i18n={I18N.transactionConfirmationISLM}
              />
            </Text>
          </DataView>
          <DataView label="Network">
            <Text t11 color={Color.textBase1}>
              <Text i18n={I18N.transactionConfirmationHAQQ} />{' '}
              <Text
                color={Color.textBase2}
                i18n={I18N.transactionConfirmationHQ}
              />
            </Text>
          </DataView>
          <DataView label="Amount">
            <Text
              t11
              color={Color.textBase1}
              i18n={I18N.transactionConfirmationAmount}
              i18params={{amount: `${+amount.toFixed(8)}`}}
            />
          </DataView>
          <DataView label="Network Fee">
            <Text
              t11
              color={Color.textBase1}
              i18n={I18N.transactionConfirmationestimateFee}
              i18params={{
                estimateFee: `${+fee * WEI}`,
              }}
            />
          </DataView>
        </View>
        {error && (
          <ErrorText center e0>
            {error}
          </ErrorText>
        )}
      </Spacer>
      <Button
        disabled={fee === 0 && !disabled}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionConfirmationSend}
        onPress={onConfirmTransaction}
        style={styles.submit}
        loading={disabled}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  contact: {
    marginHorizontal: 27.5,
    fontWeight: '600',
    height: 30,
  },
  address: {
    marginBottom: 40,
    marginHorizontal: 27.5,
  },
  subtitle: {
    marginBottom: 4,
  },
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
  },
  info: {
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  sum: {
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
  },
  submit: {
    marginVertical: 16,
  },
  spacer: {
    justifyContent: 'center',
  },
});
