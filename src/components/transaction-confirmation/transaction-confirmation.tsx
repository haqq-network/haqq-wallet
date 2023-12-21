import React, {useMemo} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Balance} from '@app/services/balance';
import {IToken} from '@app/types';
import {splitAddress} from '@app/utils';
import {LONG_NUM_PRECISION, WEI_PRECISION} from '@app/variables/common';

interface TransactionConfirmationProps {
  testID?: string;
  to: string;
  amount: Balance;
  fee: Balance | null;
  contact: Contact | null;
  disabled?: boolean;
  onConfirmTransaction: () => void;
  token: IToken;
}

export const TransactionConfirmation = ({
  testID,
  disabled,
  contact,
  to,
  amount,
  fee,
  onConfirmTransaction,
  token,
}: TransactionConfirmationProps) => {
  const splittedTo = useMemo(() => splitAddress(to), [to]);

  const sumText = useMemo(() => {
    if (fee === null) {
      return getText(I18N.estimatingGas);
    }

    if (amount.isIslamic) {
      return fee.operate(amount, 'add').toBalanceString(LONG_NUM_PRECISION);
    }

    return amount.toBalanceString(LONG_NUM_PRECISION);
  }, [fee, amount]);

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <Image source={token.image} style={styles.icon} />
      <Text
        t11
        color={Color.textBase2}
        center
        style={styles.subtitle}
        i18n={I18N.transactionConfirmationTotalAmount}
      />
      <Text t11 color={Color.textBase1} center style={styles.sum}>
        {sumText}
      </Text>
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
            <Text t11 color={Color.textBase1}>
              {amount.toBalanceString(LONG_NUM_PRECISION)}
            </Text>
          </DataView>
          <DataView label="Network Fee">
            <Text t11 color={Color.textBase1}>
              {fee === null
                ? getText(I18N.estimatingGas)
                : fee.toBalanceString(LONG_NUM_PRECISION, WEI_PRECISION)}
            </Text>
          </DataView>
        </View>
      </Spacer>
      <Button
        disabled={!fee?.isPositive() && !disabled}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionConfirmationSend}
        onPress={onConfirmTransaction}
        style={styles.submit}
        loading={disabled}
        testID={`${testID}_submit`}
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
