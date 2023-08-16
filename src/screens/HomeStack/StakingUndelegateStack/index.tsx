import React, {memo, useEffect, useState} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Loading} from '@app/components/ui';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {validatorStatus} from '@app/helpers/validator-status';
import {useCosmos, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {
  HomeEarnStackParamList,
  HomeEarnStackRoutes,
} from '@app/screens/HomeStack/HomeEarnStack';
import {StakingUnDelegateFinishScreen} from '@app/screens/HomeStack/StakingUndelegateStack/staking-undelegate-finish';
import {StakingUnDelegateFormScreen} from '@app/screens/HomeStack/StakingUndelegateStack/staking-undelegate-form';
import {StakingUnDelegatePreviewScreen} from '@app/screens/HomeStack/StakingUndelegateStack/staking-undelegate-preview';
import {ScreenOptionType, ValidatorItem} from '@app/types';

export enum StakingUnDelegateStackRoutes {
  StakingUnDelegateForm = 'stakingUnDelegateForm',
  StakingUnDelegatePreview = 'stakingUnDelegatePreview',
  StakingUnDelegateFinish = 'stakingUnDelegateFinish',
}

export type StakingUnDelegateStackParamList = HomeStackParamList & {
  [StakingUnDelegateStackRoutes.StakingUnDelegateForm]: {
    account: string;
    validator: ValidatorItem;
    maxAmount: number;
  };
  [StakingUnDelegateStackRoutes.StakingUnDelegatePreview]: {
    account: string;
    amount: number;
    fee: number;
    validator: ValidatorItem;
  };
  [StakingUnDelegateStackRoutes.StakingUnDelegateFinish]: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: number;
  };
};

const Stack = createNativeStackNavigator<StakingUnDelegateStackParamList>();

const screenOptionsPreview: ScreenOptionType = {
  title: getText(I18N.stakingUnDelegatePreviewTitle),
  ...hideBack,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.stakingUnDelegateFormTitle),
};

export const StakingUnDelegateStack = memo(() => {
  const cosmos = useCosmos();
  const {validator: paramValidator, selectedWalletAddress} = useTypedRoute<
    HomeEarnStackParamList,
    HomeEarnStackRoutes.StakingUnDelegate
  >().params;
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
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={StakingUnDelegateStackRoutes.StakingUnDelegateForm}>
      <Stack.Screen
        name={StakingUnDelegateStackRoutes.StakingUnDelegateForm}
        component={StakingUnDelegateFormScreen}
        initialParams={{validator, account: selectedWalletAddress}}
        options={screenOptionsForm}
      />
      <Stack.Screen
        name={StakingUnDelegateStackRoutes.StakingUnDelegatePreview}
        initialParams={{validator}}
        component={StakingUnDelegatePreviewScreen}
        options={screenOptionsPreview}
      />
      <Stack.Screen
        name={StakingUnDelegateStackRoutes.StakingUnDelegateFinish}
        initialParams={{validator}}
        component={StakingUnDelegateFinishScreen}
        options={hideBack}
      />
    </Stack.Navigator>
  );
});
