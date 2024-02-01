import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HomeEarnStackParamList, HomeEarnStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {HomeEarnScreen} from '@app/screens/HomeStack/HomeEarnStack/home-earn';
import {HomeStakingScreen} from '@app/screens/HomeStack/HomeEarnStack/home-staking';
import {RaffleDetailsScreen} from '@app/screens/HomeStack/HomeEarnStack/raffle-details';
import {RaffleRewardScreen} from '@app/screens/HomeStack/HomeEarnStack/raffle-reward';
import {StakingInfoScreen} from '@app/screens/HomeStack/HomeEarnStack/staking-info';
import {StakingValidatorsScreen} from '@app/screens/HomeStack/HomeEarnStack/staking-validators';
import {StakingDelegateStack} from '@app/screens/HomeStack/StakingDelegateStack';
import {StakingUnDelegateStack} from '@app/screens/HomeStack/StakingUndelegateStack';

const Stack = createNativeStackNavigator<HomeEarnStackParamList>();

const HomeEarnStack = memo(() => {
  return (
    <Stack.Navigator screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={HomeEarnStackRoutes.HomeEarn}
        component={HomeEarnScreen}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.StakingValidators}
        component={StakingValidatorsScreen}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.StakingInfo}
        component={StakingInfoScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: getText(I18N.stakingInfo),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.Staking}
        component={HomeStakingScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: '',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name={HomeEarnStackRoutes.StakingDelegate}
        component={StakingDelegateStack}
        options={{presentation: 'modal', freezeOnBlur: true}}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.StakingUnDelegate}
        component={StakingUnDelegateStack}
        options={{presentation: 'modal', freezeOnBlur: true}}
      />

      <Stack.Screen
        name={HomeEarnStackRoutes.RaffleDetails}
        component={RaffleDetailsScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.RaffleReward}
        component={RaffleRewardScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
});

export {HomeEarnStack};
