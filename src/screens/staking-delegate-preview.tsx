import React, {useCallback, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {StakingDelegatePreview} from '@app/components/staking-delegate-preview/staking-delegate-preview';
import {app} from '@app/contexts';
import {useUser, useWallet} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {Cosmos} from '@app/services/cosmos';
import {cleanNumber} from '@app/utils';

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
import {RootStackParamList} from '../types';
import {
  LIGHT_BG_3,
  LIGHT_GRAPHIC_GREEN_2,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
} from '../variables';

export const StakingDelegatePreviewScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useUser();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegatePreview'>>();

  const {amount, fee} = route.params;
  const wallet = useWallet(route.params.account);

  const [estimateFee, setEstimateFee] = useState(fee ?? 0);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const cosmos = new Cosmos(app.provider!);

        const resp = await cosmos.delegate(
          route.params.account,
          route.params.validator.operator_address,
          route.params.amount,
        );

        if (resp) {
          navigation.navigate('stakingDelegateFinish', {
            txhash: resp.tx_response.txhash,
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
  }, [wallet, navigation, amount, estimateFee, user.providerId]);

  return (
    <StakingDelegatePreview
      amount={route.params.amount}
      fee={route.params.fee}
      validator={route.params.validator}
      disabled={disabled}
      onSend={onDone}
      error={error}
    />
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
