import React, {useCallback} from 'react';

import {StakingValidators} from '@app/components/staking-validators';
import {useTypedNavigation, useValidators} from '@app/hooks';
import {ValidatorItem} from '@app/types';

export const StakingValidatorsScreen = () => {
  const navigation = useTypedNavigation();
  const {stakedValidators, unStakedValidators} = useValidators({
    withValidatorLists: true,
  });

  const onPressValidator = useCallback(
    (validator: ValidatorItem) => {
      navigation.navigate('stakingInfo', {
        validator,
      });
    },
    [navigation],
  );

  return (
    <StakingValidators
      stakedValidators={stakedValidators}
      unStakedValidators={unStakedValidators}
      onPress={onPressValidator}
    />
  );
};
