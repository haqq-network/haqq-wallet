import React, {useCallback, useEffect, useState} from 'react';

import {StakingValidators} from '@app/components/staking-validators';
import {validatorsSort} from '@app/helpers/validators-sort';
import {validatorsSplit} from '@app/helpers/validators-split';
import {useCosmos, useTypedNavigation, useWallets} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {ValidatorItem} from '@app/types';

export const StakingValidatorsScreen = () => {
  const wallets = useWallets();
  const cosmos = useCosmos();
  const [stakedValidators, setStakedValidators] = useState<ValidatorItem[]>([]);
  const [unStakedValidators, setUnStakedValidators] = useState<ValidatorItem[]>(
    [],
  );

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
    const metadata = StakingMetadata.getAll();
    const cache = new Map();

    for (const row of metadata) {
      const value = cache.get(row.validator) ?? {
        [StakingMetadataType.delegation]: 0,
        [StakingMetadataType.undelegation]: 0,
        [StakingMetadataType.reward]: 0,
      };
      cache.set(row.validator, {
        ...value,
        [row.type]: value[row.type] + row.amount,
      });
    }

    cosmos.getAllValidators(1000).then(validatorsList => {
      const staked = [];
      const unStaked = [];
      for (const validator of validatorsList.validators) {
        const info = cache.get(validator.operator_address);
        if (info) {
          staked.push({
            ...validator,
            localDelegations: info[StakingMetadataType.delegation],
            localRewards: info[StakingMetadataType.reward],
            localUnDelegations: info[StakingMetadataType.undelegation],
          });
        } else {
          unStaked.push(validator);
        }
      }

      const {
        active: stakedActive,
        inactive: stakedInactive,
        jailed: stackedJailed,
      } = validatorsSplit(staked);

      const {
        active: unStakedActive,
        inactive: unStakedInactive,
        jailed: unStackedJailed,
      } = validatorsSplit(unStaked);

      setStakedValidators(
        [
          validatorsSort(stakedActive),
          validatorsSort(stakedInactive),
          validatorsSort(stackedJailed),
        ].flat(),
      );

      setUnStakedValidators(
        [
          validatorsSort(unStakedActive),
          validatorsSort(unStakedInactive),
          validatorsSort(unStackedJailed),
        ].flat(),
      );
    });
  }, [cosmos, wallets]);
  return (
    <StakingValidators
      stakedValidators={stakedValidators}
      unStakedValidators={unStakedValidators}
      onPress={onPressValidator}
    />
  );
};
