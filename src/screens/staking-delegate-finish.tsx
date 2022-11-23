import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingDelegateFinish} from '@app/components/staking-delegate-finish/staking-delegate-finish';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {Cosmos} from '@app/services/cosmos';
import {CosmosTxV1beta1GetTxResponse} from '@app/types/cosmos';

import {RootStackParamList} from '../types';

export const StakingDelegateFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateFinish'>>();

  const [transaction, setTransaction] = useState<
    CosmosTxV1beta1GetTxResponse | undefined
  >();

  useEffect(() => {
    const cosmos = new Cosmos(app.provider!);
    cosmos.getTransaction(route.params.txhash).then(tx => {
      setTransaction(tx);
    });
  }, [route.params.txhash]);

  const onDone = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  if (!transaction) {
    return <Loading />;
  }

  return (
    <StakingDelegateFinish
      onDone={onDone}
      validator={route.params.validator}
      transaction={transaction}
    />
  );
};
