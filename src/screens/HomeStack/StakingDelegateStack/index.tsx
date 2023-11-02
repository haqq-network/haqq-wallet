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
import {StakingDelegateFinishScreen} from '@app/screens/HomeStack/StakingDelegateStack/staking-delegate-finish';
import {StakingDelegateFormScreen} from '@app/screens/HomeStack/StakingDelegateStack/staking-delegate-form';
import {StakingDelegatePreviewScreen} from '@app/screens/HomeStack/StakingDelegateStack/staking-delegate-preview';
import {Balance} from '@app/services/balance';
import {ScreenOptionType, ValidatorItem} from '@app/types';

export enum StakingDelegateStackRoutes {
  StakingDelegateForm = 'stakingDelegateForm',
  StakingDelegatePreview = 'stakingDelegatePreview',
  StakingDelegateFinish = 'stakingDelegateFinish',
}

export type StakingDelegateStackParamList = HomeStackParamList & {
  [StakingDelegateStackRoutes.StakingDelegateForm]: {
    account: string;
    validator: ValidatorItem;
  };
  [StakingDelegateStackRoutes.StakingDelegatePreview]: {
    account: string;
    amount: number;
    fee: Balance;
    validator: ValidatorItem;
  };
  [StakingDelegateStackRoutes.StakingDelegateFinish]: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: Balance;
  };
};

const Stack = createNativeStackNavigator<StakingDelegateStackParamList>();

const screenOptionsPreview: ScreenOptionType = {
  title: getText(I18N.stakingDelegatePreviewTitle),
  ...hideBack,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.stakingDelegateFormTitle),
};

export const StakingDelegateStack = memo(() => {
  const cosmos = useCosmos();
  const {
    params: {validator: paramValidator, selectedWalletAddress},
  } = useTypedRoute<
    HomeEarnStackParamList,
    HomeEarnStackRoutes.StakingDelegate
  >();
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
      initialRouteName={StakingDelegateStackRoutes.StakingDelegateForm}>
      <Stack.Screen
        name={StakingDelegateStackRoutes.StakingDelegateForm}
        component={StakingDelegateFormScreen}
        initialParams={{validator, account: selectedWalletAddress}}
        options={screenOptionsForm}
      />
      <Stack.Screen
        name={StakingDelegateStackRoutes.StakingDelegatePreview}
        initialParams={{validator}}
        component={StakingDelegatePreviewScreen}
        options={screenOptionsPreview}
      />
      <Stack.Screen
        name={StakingDelegateStackRoutes.StakingDelegateFinish}
        initialParams={{validator}}
        component={StakingDelegateFinishScreen}
        options={hideBack}
      />
    </Stack.Navigator>
  );
});
