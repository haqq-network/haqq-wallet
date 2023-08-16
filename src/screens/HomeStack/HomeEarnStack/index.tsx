import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {HomeEarnScreen} from '@app/screens/HomeStack/HomeEarnStack/home-earn';
import {HomeStakingScreen} from '@app/screens/HomeStack/HomeEarnStack/home-staking';
import {RaffleDetailsScreen} from '@app/screens/HomeStack/HomeEarnStack/raffle-details';
import {RaffleRewardScreen} from '@app/screens/HomeStack/HomeEarnStack/raffle-reward';
import {StakingInfoScreen} from '@app/screens/HomeStack/HomeEarnStack/staking-info';
import {StakingValidatorsScreen} from '@app/screens/HomeStack/HomeEarnStack/staking-validators';
import {StakingDelegateStack} from '@app/screens/HomeStack/StakingDelegateStack';
import {StakingUnDelegateStack} from '@app/screens/HomeStack/StakingUndelegateStack';
import {Raffle, ValidatorItem} from '@app/types';

export enum HomeEarnStackRoutes {
  HomeEarn = 'homeEarn_',
  StakingValidators = 'stakingValidators',
  StakingInfo = 'stakingInfo',
  Staking = 'staking',
  StakingDelegate = 'stakingDelegate',
  StakingUnDelegate = 'stakingUnDelegate',
  RaffleDetails = 'raffleDetails',
  RaffleReward = 'raffleReward',
}

export type HomeEarnStackParamList = HomeStackParamList & {
  [HomeEarnStackRoutes.HomeEarn]: undefined;
  [HomeEarnStackRoutes.StakingValidators]: undefined;
  [HomeEarnStackRoutes.StakingInfo]: {validator: ValidatorItem};
  [HomeEarnStackRoutes.Staking]: undefined;
  [HomeEarnStackRoutes.StakingDelegate]: {
    validator: string;
    selectedWalletAddress: string;
  };
  [HomeEarnStackRoutes.StakingUnDelegate]: {
    validator: string;
    selectedWalletAddress: string;
  };
  [HomeEarnStackRoutes.RaffleDetails]: {
    item: Raffle;
    prevIslmCount: number;
    prevTicketsCount: number;
  };
  [HomeEarnStackRoutes.RaffleReward]: {
    item: Raffle;
  };
};

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
          ...popupScreenOptions,
          title: getText(I18N.stakingInfo),
          headerShown: true,
          //FIXME:
          headerStyle: {marginTop: 20},
        }}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.Staking}
        component={HomeStakingScreen}
        options={{
          ...popupScreenOptions,
          title: '',
          headerShown: true,
          //FIXME:
          headerStyle: {marginTop: 20},
        }}
      />

      <Stack.Screen
        name={HomeEarnStackRoutes.StakingDelegate}
        component={StakingDelegateStack}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen
        name={HomeEarnStackRoutes.StakingUnDelegate}
        component={StakingUnDelegateStack}
        options={{presentation: 'modal'}}
      />

      <Stack.Screen
        name={HomeEarnStackRoutes.RaffleDetails}
        component={RaffleDetailsScreen}
        options={{
          ...popupScreenOptions,
          headerShown: true,
          //FIXME:
          headerStyle: {marginTop: 20},
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
