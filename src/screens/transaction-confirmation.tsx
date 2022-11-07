import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {Color, getColor} from '../colors';
import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {useContacts} from '../contexts/contacts';
import {useWallet} from '../contexts/wallets';
import {createTheme} from '../helpers/create-theme';
import {useUser} from '../hooks/use-user';
import {Transaction} from '../models/transaction';
import {EthNetwork} from '../services/eth-network';
import {RootStackParamList, WalletType} from '../types';

export const TransactionConfirmationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useUser();
  const route =
    useRoute<RouteProp<RootStackParamList, 'transactionConfirmation'>>();
  const {from, to, amount, fee, splittedTo} = route.params;
  const contacts = useContacts();
  const wallet = useWallet(from);

  const [estimateFee, setEstimateFee] = useState(fee ?? 0);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const contact = useMemo(
    () => contacts.getContact(route.params.to),
    [contacts, route.params.to],
  );

  const onDone = useCallback(async () => {
    if (wallet) {
      if (wallet.type === WalletType.ledgerBt) {
        navigation.navigate('transactionLedger', {
          from: from,
          to: to,
          amount: amount,
          fee: estimateFee,
        });

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
          await Transaction.createTransaction(
            transaction,
            user.providerId,
            estimateFee,
          );

          navigation.navigate('transactionFinish', {
            hash: transaction.hash,
          });
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
  }, [wallet, navigation, from, to, amount, estimateFee, user.providerId]);

  useEffect(() => {
    EthNetwork.estimateTransaction(from, to, amount).then(result =>
      setEstimateFee(result.fee),
    );
  }, [from, to, amount]);

  return (
    <PopupContainer style={page.container}>
      <ISLMIcon color={getColor(Color.graphicGreen2)} style={page.icon} />
      <Text t11 style={page.subtitle}>
        Total Amount
      </Text>
      <Text clean style={page.sum}>
        {(amount + estimateFee).toFixed(8)} ISLM
      </Text>
      <Text t11 style={page.subtitle}>
        Send to
      </Text>
      {contact && (
        <Text t11 style={page.contact}>
          {contact.name}
        </Text>
      )}
      <Text t11 style={page.address}>
        <Text t11 style={page.address}>
          {splittedTo[0]}
        </Text>
        <Text t11 style={{color: getColor(Color.textBase2)}}>
          {splittedTo[1]}
        </Text>
        <Text t11>{splittedTo[2]}</Text>
      </Text>

      <View style={page.info}>
        <DataView label="Cryptocurrency">
          <Text t11 style={{color: getColor(Color.textBase1)}}>
            Islamic coin{' '}
            <Text clean style={{color: getColor(Color.textBase2)}}>
              (ISLM)
            </Text>
          </Text>
        </DataView>
        <DataView label="Network">
          <Text t11 style={{color: getColor(Color.textBase1)}}>
            HAQQ blockchain{' '}
            <Text clean style={{color: getColor(Color.textBase2)}}>
              (HQ)
            </Text>
          </Text>
        </DataView>
        <DataView label="Amount">
          <Text t11 style={{color: getColor(Color.textBase1)}}>
            {amount.toFixed(8)} ISLM
          </Text>
        </DataView>
        <DataView label="Network Fee">
          <Text t11 style={{color: getColor(Color.textBase1)}}>
            {estimateFee.toFixed(8)} ISLM
          </Text>
        </DataView>
      </View>
      {error && <Text clean>{error}</Text>}
      <Spacer />
      <Button
        disabled={estimateFee === 0 && !disabled}
        variant={ButtonVariant.contained}
        title="Send"
        onPress={onDone}
        style={page.submit}
        loading={disabled}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  contact: {
    textAlign: 'center',
    color: Color.textBase1,
    marginHorizontal: 27.5,
    fontWeight: '600',
    height: 30,
  },
  address: {
    marginBottom: 40,
    textAlign: 'center',
    color: Color.textBase1,
    marginHorizontal: 27.5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 4,
    color: Color.textBase2,
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  info: {
    top: 40,
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  sum: {
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: Color.textBase1,
  },
  submit: {
    marginVertical: 16,
  },
});
