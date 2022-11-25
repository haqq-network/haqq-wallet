import React, {useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {StakingActive} from './staking-active';
import {StakingEmpty} from './staking-empty';

export type StakingHomeProps = {
  onPressValidators: () => void;
};

export const HomeStaking = ({onPressValidators}: StakingHomeProps) => {
  const [isActive] = useState(true);
  return (
    <View style={styles.container}>
      {isActive ? <StakingActive /> : <StakingEmpty />}
      {isActive && (
        <Button
          i18n={I18N.stakingHomeButton}
          variant={ButtonVariant.contained}
          onPress={onPressValidators}
          style={styles.margin}
        />
      )}
      <Button
        i18n={I18N.stakingHomeButton}
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
  sum: {
    flex: 1,
  },
  margin: {
    marginBottom: 20,
  },
  circleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
