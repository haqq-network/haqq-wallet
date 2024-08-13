import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  Icon,
  IconsName,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {Balance} from '@app/services/balance';
import {BalanceData, IToken} from '@app/types';
import {splitAddress} from '@app/utils';
import {LONG_NUM_PRECISION} from '@app/variables/common';

import {ImageWrapper} from '../image-wrapper';

interface TransactionConfirmationProps {
  testID?: string;
  to: string;
  amount: Balance;
  contact: Contact | null;
  disabled?: boolean;
  onConfirmTransaction: () => void;
  onFeePress: () => void;
  fee: Fee | null;
  token: IToken;
  balance: BalanceData;
}

export const TransactionConfirmation = observer(
  ({
    testID,
    disabled,
    contact,
    to,
    amount,
    onConfirmTransaction,
    onFeePress,
    fee,
    token,
    balance,
  }: TransactionConfirmationProps) => {
    const splittedTo = useMemo(() => splitAddress(to), [to]);

    const transactionSum = useMemo(() => {
      if (!fee?.calculatedFees) {
        return null;
      }

      if (amount.isNativeCoin) {
        return fee.calculatedFees.expectedFee.operate(amount, 'add');
      }

      return amount;
    }, [amount, fee?.calculatedFees]);

    const transactionSumError = useMemo(() => {
      if (!fee?.calculatedFees) {
        return null;
      }

      return (
        fee.calculatedFees.expectedFee
          .operate(amount, 'add')
          .operate(balance.available, 'sub')
          .toFloat() > 0
      );
    }, [amount, fee?.calculatedFees]);

    const sumText = useMemo(() => {
      if (transactionSum === null) {
        return getText(I18N.estimatingGas);
      }

      return transactionSum.toBalanceString(LONG_NUM_PRECISION);
    }, [transactionSum]);

    const usdText = useMemo(() => {
      if (transactionSum === null) {
        return '';
      }

      return transactionSum.toFiat();
    }, [transactionSum]);

    return (
      <PopupContainer style={styles.container} testID={testID}>
        <ImageWrapper source={token.image} style={styles.icon} />
        <Text
          variant={TextVariant.t11}
          color={Color.textBase2}
          position={TextPosition.center}
          style={styles.subtitle}
          i18n={I18N.transactionConfirmationTotalAmount}
        />
        <Text
          variant={TextVariant.t11}
          color={Color.textBase1}
          position={TextPosition.center}
          style={styles.sum}>
          {sumText}
        </Text>
        <Text
          variant={TextVariant.t15}
          color={Color.textBase2}
          position={TextPosition.center}>
          {usdText}
        </Text>
        <Spacer height={16} />
        <Text
          variant={TextVariant.t11}
          color={Color.textBase2}
          position={TextPosition.center}
          style={styles.subtitle}
          i18n={I18N.transactionConfirmationSendTo}
        />
        {contact && (
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            position={TextPosition.center}
            style={styles.contact}>
            {contact.name}
          </Text>
        )}
        <Text
          variant={TextVariant.t11}
          color={Color.textBase1}
          position={TextPosition.center}
          style={styles.address}>
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            position={TextPosition.center}
            style={styles.address}>
            {splittedTo[0]}
          </Text>
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {splittedTo[1]}
          </Text>
          <Text variant={TextVariant.t11}>{splittedTo[2]}</Text>
        </Text>
        <Spacer style={styles.spacer}>
          <View style={styles.info}>
            <DataView label="Cryptocurrency">
              <Text variant={TextVariant.t11} color={Color.textBase1}>
                {token.name}
              </Text>
            </DataView>
            <DataView label="Network">
              <Text variant={TextVariant.t11} color={Color.textBase1}>
                <Text>{app.provider.name}</Text>
              </Text>
            </DataView>
            <DataView label="Amount">
              <Text variant={TextVariant.t11} color={Color.textBase1}>
                {amount.toBalanceString(LONG_NUM_PRECISION)}
              </Text>
            </DataView>
            <DataView label="Network Fee">
              {!fee?.calculatedFees ? (
                <Text variant={TextVariant.t11} color={Color.textBase1}>
                  {getText(I18N.estimatingGas)}
                </Text>
              ) : (
                <View style={styles.feeContainer}>
                  <Text
                    variant={TextVariant.t11}
                    color={Color.textGreen1}
                    onPress={onFeePress}>
                    {fee.expectedFeeString}
                  </Text>
                  <Icon name={IconsName.tune} color={Color.textGreen1} />
                </View>
              )}
            </DataView>
          </View>
          {transactionSumError && (
            <Text
              color={Color.graphicRed1}
              i18n={I18N.transactionSumError}
              i18params={{symbol: app.provider.weiDenom}}
            />
          )}
        </Spacer>
        <Button
          disabled={!fee?.expectedFee?.isPositive() && !disabled}
          variant={ButtonVariant.contained}
          i18n={I18N.transactionConfirmationSend}
          onPress={onConfirmTransaction}
          style={styles.submit}
          loading={disabled}
          testID={`${testID}_submit`}
        />
      </PopupContainer>
    );
  },
);

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
  feeContainer: {
    flexDirection: 'row',
  },
});
