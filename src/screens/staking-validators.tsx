import React, {useCallback, useEffect, useRef, useState} from 'react';

import {StakingValidators} from '@app/components/staking-validators';
import {app} from '@app/contexts';
import {validatorsSort} from '@app/helpers/validators-sort';
import {validatorsSplit} from '@app/helpers/validators-split';
import {useTypedNavigation, useWallets} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';
import {ValidatorItem} from '@app/types';

export const StakingValidatorsScreen = () => {
  const wallets = useWallets();
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const [validators, setValidators] = useState<ValidatorItem[]>([]);

  const navigation = useTypedNavigation();
  const onPressValidator = useCallback(
    (validator: ValidatorItem) => {
      navigation.navigate('stakingInfo', {
        validator,
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
  }, [cosmos, wallets.visible]);
  return (
    <StakingValidators validators={validators} onPress={onPressValidator} />
  );
};
