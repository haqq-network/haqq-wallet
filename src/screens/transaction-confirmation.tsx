import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

import {useContacts, useUser, useWallet} from '@app/hooks';

import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {Transaction} from '../models/transaction';
import {EthNetwork} from '../services/eth-network';
import {RootStackParamList, WalletType} from '../types';
import {
  LIGHT_BG_3,
  LIGHT_GRAPHIC_GREEN_2,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
} from '../variables';

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
      <ISLMIcon color={LIGHT_GRAPHIC_GREEN_2} style={page.icon} />
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
        <Text t11 style={{color: LIGHT_TEXT_BASE_2}}>
          {splittedTo[1]}
        </Text>
        <Text t11>{splittedTo[2]}</Text>
      </Text>

      <View style={page.info}>
        <DataView label="Cryptocurrency">
          <Text t11 style={{color: LIGHT_TEXT_BASE_1}}>
            Islamic coin{' '}
            <Text clean style={{color: LIGHT_TEXT_BASE_2}}>
              (ISLM)
            </Text>
          </Text>
        </DataView>
        <DataView label="Network">
          <Text t11 style={{color: LIGHT_TEXT_BASE_1}}>
            HAQQ blockchain{' '}
            <Text clean style={{color: LIGHT_TEXT_BASE_2}}>
              (HQ)
            </Text>
          </Text>
        </DataView>
        <DataView label="Amount">
          <Text t11 style={{color: LIGHT_TEXT_BASE_1}}>
            {amount.toFixed(8)} ISLM
          </Text>
        </DataView>
        <DataView label="Network Fee">
          <Text t11 style={{color: LIGHT_TEXT_BASE_1}}>
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

const page = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  contact: {
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
    marginHorizontal: 27.5,
    fontWeight: '600',
    height: 30,
  },
  address: {
    marginBottom: 40,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
    marginHorizontal: 27.5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 4,
    color: LIGHT_TEXT_BASE_2,
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  info: {top: 40, borderRadius: 16, backgroundColor: LIGHT_BG_3},
  sum: {
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
  },
  submit: {
    marginVertical: 16,
  },
});
