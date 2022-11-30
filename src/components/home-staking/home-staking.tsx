import React from 'react';

import {View} from 'react-native';

import {Button, ButtonVariant, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type StakingHomeProps = {
  onPressValidators: () => void;
};
export const HomeStaking = ({onPressValidators}: StakingHomeProps) => {
  return (
    <View style={styles.container}>
      <Spacer />
      <Button
        i18n={I18N.stakingHomeButton}
        variant={ButtonVariant.contained}
        onPress={onPressValidators}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
