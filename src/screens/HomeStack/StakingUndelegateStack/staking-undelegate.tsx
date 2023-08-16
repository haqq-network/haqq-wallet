import React, {useEffect, useState} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {validatorStatus} from '@app/helpers/validator-status';
import {useCosmos, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingUnDelegateFinishScreen} from '@app/screens/HomeStack/StakingUndelegateStack/staking-undelegate-finish';
import {StakingUnDelegateFormScreen} from '@app/screens/staking-undelegate-form';
import {StakingUnDelegatePreviewScreen} from '@app/screens/staking-undelegate-preview';
import {ScreenOptionType, ValidatorItem} from '@app/types';

const StakingUnDelegateStack = createStackNavigator();

const screenOptionsPreview: ScreenOptionType = {
  title: getText(I18N.stakingUnDelegatePreviewTitle),
  ...hideBack,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.stakingUnDelegateFormTitle),
};

export const StakingUnDelegateScreen = () => {
  const cosmos = useCosmos();
  const {validator: paramValidator, selectedWalletAddress} =
    useTypedRoute<'stakingUnDelegate'>().params;
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
    return <></>;
  }
  return (
    <StakingUnDelegateStack.Navigator
      screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}
      initialRouteName={'stakingUnDelegateForm'}>
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegateForm"
        component={StakingUnDelegateFormScreen}
        initialParams={{validator, account: selectedWalletAddress}}
        options={screenOptionsForm}
      />
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegatePreview"
        initialParams={{validator}}
        component={StakingUnDelegatePreviewScreen}
        options={screenOptionsPreview}
      />
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegateFinish"
        initialParams={{validator}}
        component={StakingUnDelegateFinishScreen}
        options={hideBack}
      />
    </StakingUnDelegateStack.Navigator>
  );
};
