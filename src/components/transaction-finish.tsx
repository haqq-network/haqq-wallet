import React, {useMemo} from 'react';

import {BigNumber} from '@ethersproject/bignumber';
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
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {Balance} from '@app/services/balance';
import {EthNetwork} from '@app/services/eth-network/eth-network';
import {IToken, TransactionResponse} from '@app/types';
import {CURRENCY_NAME} from '@app/variables/common';

type TransactionFinishProps = {
  transaction: TransactionResponse | null;
  onSubmit: () => void;
  onPressContact: () => void;
  contact: Contact | null;
  short: string;
  testID?: string;
  token: IToken;
  amount?: Balance;
  hideContact?: boolean;
  fee: Fee;
};

export const TransactionFinish = ({
  transaction,
  onSubmit,
  onPressContact,
  contact,
  short,
  testID,
  token,
  amount,
  hideContact,
  fee,
}: TransactionFinishProps) => {
  const onPressHash = async () => {
    const url = `${EthNetwork.explorer}tx/${transaction?.hash}`;
    await openURL(url);
  };

  const transactionAmount = useMemo(() => {
    if (amount) {
      return amount;
    }

    if (transaction?.value instanceof BigNumber) {
      return new Balance(
        (transaction as TransactionResponse)?.value._hex ?? 0,
        undefined,
        token.symbol ?? CURRENCY_NAME,
      );
    }
    return new Balance(
      transaction?.value ?? 0,
      undefined,
      token.symbol ?? CURRENCY_NAME,
    );
  }, [transaction, token, amount]);

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <View style={styles.sub}>
        <LottieWrap
          source={require('@assets/animations/transaction-finish.json')}
          style={styles.image}
          autoPlay={true}
          loop={false}
        />
      </View>
      <Text
        variant={TextVariant.t4}
        i18n={I18N.transactionFinishSendingComplete}
        style={styles.title}
        position={TextPosition.center}
        color={Color.textGreen1}
      />
      <Image source={token.image} style={styles.icon} />
      {transaction && (
        <Text
          variant={TextVariant.t5}
          position={TextPosition.center}
          style={styles.sum}>
          - {transactionAmount.toBalanceString('auto')}
        </Text>
      )}

      <View style={styles.contactLine}>
        {contact?.name && (
          <Text
            variant={TextVariant.t13}
            position={TextPosition.center}
            style={styles.address}>
            {contact.name + ' '}
          </Text>
        )}
        <Text
          variant={TextVariant.t14}
          position={TextPosition.center}
          style={styles.address}>
          {short}
        </Text>
      </View>

      <NetworkFee fee={fee?.expectedFee} currency="ISLM" />

      <View style={styles.providerContainer}>
        <Text
          variant={TextVariant.t14}
          color={Color.textBase2}
          i18n={I18N.transactionConfirmationHAQQ}
        />
        <Text
          variant={TextVariant.t14}
          color={Color.textBase2}
          i18n={I18N.transactionConfirmationHQ}
        />
      </View>

      <Spacer minHeight={20} />
      <View style={styles.buttons}>
        {!hideContact && (
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
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionFinishDone}
        onPress={onSubmit}
        testID={`${testID}_finish`}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
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
