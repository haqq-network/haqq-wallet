import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Validator} from '@evmos/provider/dist/rest/staking';
import {autorun} from 'mobx';
import {observer} from 'mobx-react';

import {
  StakingValidators,
  Validators,
} from '@app/components/staking-validators';
import {setValidatorsPower} from '@app/helpers/validators-power';
import {validatorsSortPower} from '@app/helpers/validators-sort';
import {validatorsSplit} from '@app/helpers/validators-split';
import {useCosmos, useTypedNavigation} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {HomeEarnStackParamList, HomeEarnStackRoutes} from '@app/route-types';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, ValidatorItem} from '@app/types';

export const StakingValidatorsScreen = observer(() => {
  const navigation = useTypedNavigation<HomeEarnStackParamList>();
  const cosmos = useCosmos();

  const [stakingCache, setStakingCache] = useState<
    Record<string, Record<StakingMetadataType, number>>
  >({});
  const [validators, setValidators] = useState<Validator[]>([]);

  useEffect(() => {
    EventTracker.instance.trackEvent(MarketingEvents.stakingValidators);
  }, []);

  useEffect(() => {
    const rows = StakingMetadata.getAll();
    const disposer = autorun(() => {
      const cache = rows.reduce<Record<string, any>>((memo, row) => {
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
      }, {});
      const keys = Object.keys(cache);
      if (
        keys.length !== Object.keys(stakingCache).length ||
        keys.find(key => !stakingCache[key])
      ) {
        setStakingCache(cache);
      }
    });

    return () => {
      disposer();
    };
  }, [stakingCache]);

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

  const [stakedValidators, unStakedValidators] = useMemo((): [
    Validators,
    Validators,
  ] => {
    if (!Array.isArray(validators)) {
      return [
        {
          active: [],
          inactive: [],
          jailed: [],
        },
        {
          active: [],
          inactive: [],
          jailed: [],
        },
      ];
    }
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

    let {
      active: stakedActive,
      inactive: stakedInactive,
      jailed: stackedJailed,
    } = validatorsSplit(staked);

    let {
      active: unStakedActive,
      inactive: unStakedInactive,
      jailed: unStackedJailed,
    } = validatorsSplit(unStaked);

    // Calculate total coins amount for all active validators.
    const totalActiveTokens = [...stakedActive, ...unStakedActive].reduce(
      (acc, item) => acc + Number.parseInt(item.tokens, 10),
      0,
    );
    // Set power field in percents for all active validators
    stakedActive = setValidatorsPower(stakedActive, totalActiveTokens);
    unStakedActive = setValidatorsPower(unStakedActive, totalActiveTokens);

    return [
      {
        active: validatorsSortPower(stakedActive),
        inactive: validatorsSortPower(stakedInactive),
        jailed: validatorsSortPower(stackedJailed),
      },
      {
        active: unStakedActive,
        inactive: unStakedInactive,
        jailed: unStackedJailed,
      },
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
