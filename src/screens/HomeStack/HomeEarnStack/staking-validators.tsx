import React, {
  memo as memoHOC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {Validator} from '@evmos/provider/dist/rest/staking';

import {StakingValidators} from '@app/components/staking-validators';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {validatorsSort} from '@app/helpers/validators-sort';
import {validatorsSplit} from '@app/helpers/validators-split';
import {useCosmos, useTypedNavigation} from '@app/hooks';
import {useThrottle} from '@app/hooks/use-throttle';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {
  HomeEarnStackParamList,
  HomeEarnStackRoutes,
} from '@app/screens/HomeStack/HomeEarnStack';
import {AdjustEvents, ValidatorItem} from '@app/types';

export const StakingValidatorsScreen = memoHOC(() => {
  const navigation = useTypedNavigation<HomeEarnStackParamList>();

  const cosmos = useCosmos();
  const [stakingCache, setStakingCache] = useState<
    Record<string, Record<StakingMetadataType, number>>
  >({});
  const [validators, setValidators] = useState<Validator[]>([]);

  useEffect(() => {
    onTrackEvent(AdjustEvents.stakingValidators);
  }, []);

  const onCache = useThrottle(() => {
    const cache = StakingMetadata.getAll().reduce<Record<string, any>>(
      (memo, row) => {
        const value = memo[row.validator] || {
          [StakingMetadataType.delegation]: 0,
          [StakingMetadataType.undelegation]: 0,
          [StakingMetadataType.reward]: 0,
        };

        memo[row.validator] = {
          ...value,
          [row.type]: value[row.type] + row.amount,
        };

        return memo;
      },
      {},
    );
    setStakingCache(cache);
  }, 1000);

  useEffect(() => {
    const rows = StakingMetadata.getAll();
    rows.addListener(onCache);

    onCache();
    return () => {
      rows.removeListener(onCache);
    };
  }, [onCache]);

  useEffect(() => {
    cosmos.getAllValidators(1000).then(validatorsList => {
      setValidators(validatorsList.validators);
    });
  }, [cosmos]);

  const onPressValidator = useCallback(
    (validator: ValidatorItem) => {
      navigation.navigate(HomeEarnStackRoutes.StakingInfo, {
        validator,
      });
    },
    [navigation],
  );

  const [stakedValidators, unStakedValidators] = useMemo(() => {
    const staked = [];
    const unStaked = [];
    for (const validator of validators) {
      const info = stakingCache[validator.operator_address];
      if (info) {
        staked.push({
          ...validator,
          localDelegations: info[StakingMetadataType.delegation],
          localRewards: info[StakingMetadataType.reward],
          localUnDelegations: info[StakingMetadataType.undelegation],
          searchString: `${validator.description.moniker}`.toLowerCase(),
        });
      } else {
        unStaked.push({
          ...validator,
          searchString: `${validator.description.moniker}`.toLowerCase(),
        });
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

    return [
      [
        validatorsSort(stakedActive),
        validatorsSort(stakedInactive),
        validatorsSort(stackedJailed),
      ].flat(),
      [
        validatorsSort(unStakedActive),
        validatorsSort(unStakedInactive),
        validatorsSort(unStackedJailed),
      ].flat(),
    ];
  }, [stakingCache, validators]);

  return (
    <StakingValidators
      onGoBack={navigation.goBack}
      stakedValidators={stakedValidators}
      unStakedValidators={unStakedValidators}
      onPress={onPressValidator}
    />
  );
});
