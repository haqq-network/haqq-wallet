import React, {useCallback, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingDelegatePreview} from '@app/components/staking-delegate-preview/staking-delegate-preview';
import {app} from '@app/contexts';
import {useTypedNavigation, useWallet} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';

import {RootStackParamList} from '../types';

export const StakingDelegatePreviewScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegatePreview'>>();

  const wallet = useWallet(route.params.account);

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
            validator: route.params.validator,
            amount: route.params.amount,
            fee: route.params.fee,
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
  }, [
    wallet,
    route.params.account,
    route.params.validator,
    route.params.amount,
    route.params.fee,
    navigation,
  ]);

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
