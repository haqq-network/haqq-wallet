import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {SssMigrateAgreementScreen} from '@app/screens/sss-migrate-agreement';
import {SssMigrateFinishScreen} from '@app/screens/sss-migrate-finish';
import {SssMigrateNetworksScreen} from '@app/screens/sss-migrate-networks';
import {SssMigrateRewriteScreen} from '@app/screens/sss-migrate-rewrite';
import {SssMigrateStoreScreen} from '@app/screens/sss-migrate-store';

const SssStack = createStackNavigator();

export const SssMigrateScreen = () => {
  const route = useTypedRoute<'sssMigrate'>();
  return (
    <SssStack.Navigator screenOptions={popupScreenOptions}>
      <SssStack.Screen
        name="sssMigrateAgreement"
        component={SssMigrateAgreementScreen}
        options={hideBack}
        initialParams={{
          accountId: route.params.accountId,
        }}
      />
      <SssStack.Screen
        name="sssMigrateNetworks"
        component={SssMigrateNetworksScreen}
        options={hideBack}
      />
      <SssStack.Screen
        name="sssMigrateRewrite"
        component={SssMigrateRewriteScreen}
        options={hideBack}
      />
      <SssStack.Screen
        name="sssMigrateStore"
        component={SssMigrateStoreScreen}
        options={hideBack}
      />
      <SssStack.Screen
        name="sssMigrateFinish"
        component={SssMigrateFinishScreen}
        options={hideBack}
      />
    </SssStack.Navigator>
  );
};
