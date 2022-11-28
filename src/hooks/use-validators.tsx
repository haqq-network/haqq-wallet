import {useEffect, useRef, useState} from 'react';

import {app} from '@app/contexts';
import {validatorsSort} from '@app/helpers/validators-sort';
import {validatorsSplit} from '@app/helpers/validators-split';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';
import {ValidatorItem} from '@app/types';
import {WEI} from '@app/variables';

const initialSumData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  stakedValidators: [] as ValidatorItem[],
  unStakedValidators: [] as ValidatorItem[],
};

export const useValidators = () => {
  const cosmos = useRef(new Cosmos(app.provider!)).current;

  const [data, setData] = useState(initialSumData);
  const [loading, setLoading] = useState(true);

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

    cosmos.getAllValidators(1000).then(({validators}) => {
      const staked = [];
      const unStaked = [];
      for (const validator of validators) {
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

      const stakedValidators = [
        validatorsSort(stakedActive),
        validatorsSort(stakedInactive),
        validatorsSort(stackedJailed),
      ].flat();

      const unStakedValidators = [
        validatorsSort(unStakedActive),
        validatorsSort(unStakedInactive),
        validatorsSort(unStackedJailed),
      ].flat();

      // stacked info
      const rewardsSum =
        stakedValidators.reduce((acc, v) => {
          return acc + (v?.localRewards ?? 0);
        }, 0) / WEI;
      const stakingSum =
        stakedValidators.reduce((acc, v) => {
          return acc + (v?.localDelegations ?? 0);
        }, 0) / WEI;

      const unDelegationSum =
        stakedValidators.reduce((acc, v) => {
          return acc + (v?.localUnDelegations ?? 0);
        }, 0) / WEI;

      setData({
        rewardsSum,
        stakingSum,
        unDelegationSum,
        unStakedValidators,
        stakedValidators,
      });
      setLoading(false);
    });
  }, [cosmos]);
  return {...data, loading};
};
