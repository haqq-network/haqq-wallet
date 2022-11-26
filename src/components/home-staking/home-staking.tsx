import React, {useEffect, useMemo, useRef, useState} from 'react';

import {View} from 'react-native';

import {Button, ButtonVariant} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useWalletsList} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Cosmos} from '@app/services/cosmos';

import {StakingActive, StakingActiveInterface} from './staking-active';
import {StakingEmpty} from './staking-empty';

export type StakingHomeProps = {
  onPressValidators: () => void;
  onPressGetRewards?: () => void;
};

export const HomeStaking = ({
  onPressValidators,
  onPressGetRewards,
}: StakingHomeProps) => {
  const [hasStaking] = useState(true);
  const [canGetRewards] = useState(true);

  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const {visible} = useWalletsList();
  const stakingActiveRef = useRef<StakingActiveInterface>(null);

  const availableSum = useMemo(() => {
    return visible.reduce((acc, w) => acc + w.balance, 0);
  }, [visible]);

  useEffect(() => {
    const addressList = visible.map(w => w.cosmosAddress);
    cosmos.sync(addressList).then(validatorsList => {
      console.log('🚀 - validatorsList', validatorsList);
    });
  }, [cosmos, visible]);

  const handleGetRewards = () => {
    canGetRewards && onPressGetRewards?.();
    stakingActiveRef.current?.getReward();
  };

  return (
    <View style={styles.container}>
      {hasStaking ? (
        <StakingActive
          ref={stakingActiveRef}
          stakedSum={21}
          rewardSum={40}
          availableSum={availableSum}
        />
      ) : (
        <StakingEmpty availableSum={availableSum} />
      )}
      {hasStaking && (
        <Button
          i18n={I18N.stakingHomeGetRewards}
          variant={ButtonVariant.second}
          disabled={!canGetRewards}
          onPress={handleGetRewards}
          style={styles.margin}
        />
      )}
      <Button
        i18n={I18N.stakingHomeValidators}
        variant={ButtonVariant.contained}
        onPress={onPressValidators}
        style={styles.margin}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  margin: {
    marginBottom: 20,
  },
});
