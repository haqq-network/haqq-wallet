import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {PopupHeader} from '@app/components';
import {GoBackPopupButton} from '@app/components/popup/go-back-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {I18N, getText} from '@app/i18n';
import {GovernanceListScreen} from '@app/screens/governance-list';
import {ProposalScreen} from '@app/screens/proposal';
import {StackPresentationTypes} from '@app/types';

const GovernanceStack = createStackNavigator();

const governanceOptions = {
  headerShown: false,
  tab: false,
};

const proposalOptions = {
  title: getText(I18N.proposalTitle),
  headerShown: true,
  header: PopupHeader,
  headerLeft: () => <GoBackPopupButton />,
  headerRight: SpacerPopupButton,
  presentation: 'modal' as StackPresentationTypes,
};

const screenOptions = {
  gestureEnabled: false,
  headerShown: false,
  keyboardHandlingEnabled: false,
};

export const GovernanceScreen = () => {
  return (
    <GovernanceStack.Navigator screenOptions={screenOptions}>
      <GovernanceStack.Screen
        name="governaneList"
        component={GovernanceListScreen}
        options={governanceOptions}
      />
      <GovernanceStack.Screen
        name="proposal"
        component={ProposalScreen}
        options={proposalOptions}
      />
    </GovernanceStack.Navigator>
  );
};
