import React, {useEffect, useMemo, useState} from 'react';

import {ethers} from 'ethers';
import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useContacts, useTypedRoute, useUser, useWallet} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';

interface TransactionConfirmationProps {
  onDoneLedgerBt: (estimateFee: number) => void;
  onDoneTransaction: (
    transaction: ethers.providers.TransactionResponse,
  ) => void;
}

export const TransactionConfirmation = ({
  onDoneLedgerBt,
  onDoneTransaction,
}: TransactionConfirmationProps) => {
  const providerId = useUser().providerId;
  const {from, to, amount, fee, splittedTo} =
    useTypedRoute<'transactionConfirmation'>().params;
  const contacts = useContacts();
  const wallet = useWallet(from);

  const [estimateFee, setEstimateFee] = useState(fee ?? 0);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const contact = useMemo(() => contacts.getContact(to), [contacts, to]);

  const onDone = async () => {
    if (wallet) {
      if (wallet.type === WalletType.ledgerBt) {
        onDoneLedgerBt(estimateFee);
        return;
      }

      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork(wallet);

        const transaction = await ethNetworkProvider.sendTransaction(
          to,
          amount,
        );

        if (transaction) {
          Transaction.createTransaction(transaction, providerId, estimateFee);
          onDoneTransaction(transaction);
        }
      } catch (e) {
        console.log('onDone', e);
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setDisabled(false);
      }
    }
  };

  useEffect(() => {
    EthNetwork.estimateTransaction(from, to, amount).then(result =>
      setEstimateFee(result.fee),
    );
  }, [from, to, amount]);

  return (
    <PopupContainer style={styles.container}>
      <ISLMIcon color={getColor(Color.graphicGreen2)} style={styles.icon} />
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
        i18params={{sum: `${+(amount + estimateFee).toFixed(8)}`}}
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
                estimateFee: `${+estimateFee.toFixed(15) * 10 ** 15}`,
              }}
            />
          </DataView>
        </View>
        {error && <Text clean>{error}</Text>}
      </Spacer>
      <Button
        disabled={estimateFee === 0 && !disabled}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionConfirmationSend}
        onPress={onDone}
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
  icon: {marginBottom: 16, alignSelf: 'center'},
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
