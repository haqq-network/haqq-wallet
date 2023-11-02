import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {SssMigrateAgreementScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-agreement';
import {SssMigrateFinishScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-finish';
import {SssMigrateNetworksScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-networks';
import {SssMigrateRewriteScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-rewrite';
import {SssMigrateStoreScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-store';
import {SssProviders} from '@app/services/provider-sss';

export enum SssMigrateStackRoutes {
  SssMigrateAgreement = 'sssMigrateAgreement',
  SssMigrateNetworks = 'sssMigrateNetworks',
  SssMigrateRewrite = 'sssMigrateRewrite',
  SssMigrateStore = 'sssMigrateStore',
  SssMigrateFinish = 'sssMigrateFinish',
}

export type SssMigrateStackParamList = HomeStackParamList & {
  [SssMigrateStackRoutes.SssMigrateAgreement]: {accountId: string};
  [SssMigrateStackRoutes.SssMigrateNetworks]: {accountId: string};
  [SssMigrateStackRoutes.SssMigrateRewrite]: {
    accountId: string;
    privateKey: string;
    provider: SssProviders;
    email?: string;
    verifier: string;
    token: string;
  };
  [SssMigrateStackRoutes.SssMigrateStore]: {
    accountId: string;
    privateKey: string | null;
    provider?: SssProviders;
    email?: string;
    verifier: string;
    token: string;
  };
  [SssMigrateStackRoutes.SssMigrateFinish]: undefined;
};

const Stack = createNativeStackNavigator<SssMigrateStackParamList>();

export const SssMigrateStack = memo(() => {
  const route = useTypedRoute<HomeStackParamList, HomeStackRoutes.SssMigrate>();
  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateAgreement}
        component={SssMigrateAgreementScreen}
        options={hideBack}
        initialParams={{
          accountId: route.params.accountId,
        }}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateNetworks}
        component={SssMigrateNetworksScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateRewrite}
        component={SssMigrateRewriteScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateStore}
        component={SssMigrateStoreScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateFinish}
        component={SssMigrateFinishScreen}
        options={hideBack}
      />
    </Stack.Navigator>
  );
});
