import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {
  HomeStackParamList,
  HomeStackRoutes,
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/route-types';
import {SssMigrateAgreementScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-agreement';
import {SssMigrateFinishScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-finish';
import {SssMigrateNetworksScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-networks';
import {SssMigrateRewriteScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-rewrite';
import {SssMigrateStoreScreen} from '@app/screens/HomeStack/SssMigrate/sss-migrate-store';
import {SignUpImportantInfoScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-important-info';

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
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateSignupImportantInfo}
        component={SignUpImportantInfoScreen}
      />
    </Stack.Navigator>
  );
});
