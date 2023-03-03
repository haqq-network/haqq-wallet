import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {MpcNetworksScreen} from '@app/screens/mpc-networks';
import {MpcQuestionScreen} from '@app/screens/mpc-question';

const LedgerStack = createStackNavigator();

export const MpcScreen = () => {
  return (
    <LedgerStack.Navigator screenOptions={popupScreenOptions}>
      <LedgerStack.Screen
        name="mpcNetworks"
        component={MpcNetworksScreen}
        options={hideBack}
      />
      <LedgerStack.Screen
        name="mpcQuestion"
        component={MpcQuestionScreen}
        options={hideBack}
      />
    </LedgerStack.Navigator>
  );
};
