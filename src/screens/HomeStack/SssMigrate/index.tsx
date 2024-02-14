import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
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
        component={themeUpdaterHOC(SssMigrateAgreementScreen)}
        options={hideBack}
        initialParams={{
          accountId: route.params.accountId,
        }}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateNetworks}
        component={themeUpdaterHOC(SssMigrateNetworksScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateRewrite}
        component={themeUpdaterHOC(SssMigrateRewriteScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateStore}
        component={themeUpdaterHOC(SssMigrateStoreScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateFinish}
        component={themeUpdaterHOC(SssMigrateFinishScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={SssMigrateStackRoutes.SssMigrateSignupImportantInfo}
        component={themeUpdaterHOC(SignUpImportantInfoScreen)}
      />
    </Stack.Navigator>
  );
});
