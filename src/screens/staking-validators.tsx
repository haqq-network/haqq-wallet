import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingValidators} from '@app/components/staking-validators';
import {app} from '@app/contexts';
import {validatorsSort} from '@app/helpers/validators-sort';
import {validatorsSplit} from '@app/helpers/validators-split';
import {Cosmos} from '@app/services/cosmos';
import {RootStackParamList, ValidatorItem} from '@app/types';

export const StakingValidatorsScreen = () => {
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const [validators, setValidators] = useState<ValidatorItem[]>([]);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const onPressValidator = useCallback(
    (address: string) => {
      navigation.navigate('stakingInfo', {
        address,
      });
    },
    [navigation],
  );

  useEffect(() => {
    cosmos
      .getAllValidators(1000)
      .then(validatorsList => {
        const {active, inactive, jailed} = validatorsSplit(
          validatorsList.validators,
        );

        return [
          validatorsSort(active),
          validatorsSort(inactive),
          validatorsSort(jailed),
        ].flat();
      })
      .then(validatorsList => {
        setValidators(validatorsList);
      });
  }, [cosmos]);
  return (
    <StakingValidators validators={validators} onPress={onPressValidator} />
  );
};
