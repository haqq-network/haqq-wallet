import React, {useEffect, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

import {app} from '@app/contexts';
import {Cosmos, GetTransactionResponse, TxResponse} from '@app/services/cosmos';

import {
  Button,
  ButtonVariant,
  ISLMIcon,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {RootStackParamList} from '../types';
import {
  LIGHT_BG_8,
  LIGHT_GRAPHIC_GREEN_1,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_GREEN_1,
} from '../variables';

const icon = require('../../assets/animations/transaction-finish.json');

export const StakingDelegateFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateFinish'>>();

  const [transaction, setTransaction] = useState<TxResponse | undefined>();

  useEffect(() => {
    const cosmos = new Cosmos(app.provider!);
    cosmos.getTransaction(route.params.txhash).then(tx => {
      setTransaction(tx.tx_response);
    });
  }, [route.params.txhash]);

  return (
    <PopupContainer style={page.container}>
      <View style={page.sub}>
        <LottieWrap source={icon} style={page.image} autoPlay loop={false} />
      </View>
      <Text t4 style={page.title}>
        Sending Completed!
      </Text>
      <ISLMIcon color={LIGHT_GRAPHIC_GREEN_1} style={page.icon} />
      {transaction && (
        <Text clean style={page.sum}>
          - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
        </Text>
      )}
      <Text clean style={page.address}>
        {short}
      </Text>
      <Text clean style={page.fee}>
        Network Fee: {transaction?.fee.toFixed(8)} ISLM
      </Text>
      <Spacer />
      <Button
        style={page.margin}
        variant={ButtonVariant.contained}
        title="Done"
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
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
    color: LIGHT_TEXT_GREEN_1,
    textAlign: 'center',
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  sum: {
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
  },
  address: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
    marginBottom: 4,
  },
  fee: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
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
    backgroundColor: LIGHT_BG_8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
  },
  margin: {marginBottom: 16},
});
