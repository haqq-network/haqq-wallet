import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {MpcMigrateAgreementScreen} from '@app/screens/mpc-migrate-agreement';
import {MpcMigrateFinishScreen} from '@app/screens/mpc-migrate-finish';
import {MpcMigrateNetworksScreen} from '@app/screens/mpc-migrate-networks';
import {MpcMigrateRewriteScreen} from '@app/screens/mpc-migrate-rewrite';
import {MpcMigrateStoreScreen} from '@app/screens/mpc-migrate-store';

const MpcStack = createStackNavigator();

export const MpcMigrateScreen = () => {
  const route = useTypedRoute<'mpcMigrate'>();
  return (
    <MpcStack.Navigator screenOptions={popupScreenOptions}>
      <MpcStack.Screen
        name="mpcMigrateAgreement"
        component={MpcMigrateAgreementScreen}
        options={hideBack}
        initialParams={{
          accountId: route.params.accountId,
        }}
      />
      <MpcStack.Screen
        name="mpcMigrateNetworks"
        component={MpcMigrateNetworksScreen}
        options={hideBack}
      />
      <MpcStack.Screen
        name="mpcMigrateRewrite"
        component={MpcMigrateRewriteScreen}
        options={hideBack}
      />
      <MpcStack.Screen
        name="mpcMigrateStore"
        component={MpcMigrateStoreScreen}
        options={hideBack}
      />
      <MpcStack.Screen
        name="mpcMigrateFinish"
        component={MpcMigrateFinishScreen}
        options={hideBack}
      />
    </MpcStack.Navigator>
  );
};
