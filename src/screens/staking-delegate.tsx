import React, {useEffect, useRef, useState} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {validatorStatus} from '@app/helpers/validator-status';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingDelegateFinishScreen} from '@app/screens/staking-delegate-finish';
import {StakingDelegateFormScreen} from '@app/screens/staking-delegate-form';
import {StakingDelegatePreviewScreen} from '@app/screens/staking-delegate-preview';
import {Cosmos} from '@app/services/cosmos';
import {ScreenOptionType, ValidatorItem} from '@app/types';

const StakingDelegateStack = createStackNavigator();

const screenOptionsPreview: ScreenOptionType = {
  title: getText(I18N.stakingDelegatePreviewTitle),
  ...hideBack,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.stakingDelegateFormTitle),
};

export const StakingDelegateScreen = () => {
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const {
    params: {validator: paramValidator, selectedWalletAddress},
  } = useTypedRoute<'stakingDelegate'>();

  const [validator, setValidator] = useState<ValidatorItem | undefined>();

  useEffect(() => {
    cosmos.getValidator(paramValidator).then(resp => {
      setValidator({
        ...resp.validator,
        localStatus: validatorStatus(resp.validator),
      });
    });
  }, [cosmos, paramValidator]);

  if (!validator) {
    return <Loading />;
  }

  return (
    <StakingDelegateStack.Navigator
      screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}
      initialRouteName={'stakingDelegateForm'}>
      <StakingDelegateStack.Screen
        name="stakingDelegateForm"
        component={StakingDelegateFormScreen}
        initialParams={{validator, account: selectedWalletAddress}}
        options={screenOptionsForm}
      />
      <StakingDelegateStack.Screen
        name="stakingDelegatePreview"
        initialParams={{validator}}
        component={StakingDelegatePreviewScreen}
        options={screenOptionsPreview}
      />
      <StakingDelegateStack.Screen
        name="stakingDelegateFinish"
        initialParams={{validator}}
        component={StakingDelegateFinishScreen}
        options={hideBack}
      />
    </StakingDelegateStack.Navigator>
  );
};
