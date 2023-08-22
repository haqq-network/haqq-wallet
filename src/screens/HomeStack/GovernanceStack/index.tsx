import React, {memo} from 'react';

import {Proposal as ProposalProvider} from '@evmos/provider';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {PopupHeader} from '@app/components';
import {GoBackPopupButton} from '@app/components/popup/go-back-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {I18N, getText} from '@app/i18n';
import {GovernanceListScreen} from '@app/screens/HomeStack/GovernanceStack/governance-list';
import {ProposalScreen} from '@app/screens/HomeStack/GovernanceStack/proposal';
import {ProposalDepositStack} from '@app/screens/HomeStack/GovernanceStack/ProposalDepositStack';
import {HomeFeedStackParamList} from '@app/screens/HomeStack/HomeFeedStack';
import {StackPresentationTypes} from '@app/types';

export enum GovernanceStackRoutes {
  GovernanceList = 'governaneList',
  Proposal = 'proposal',
  ProposalDeposit = 'proposalDeposit',
}

export type GovernanceStackParamList = HomeFeedStackParamList & {
  [GovernanceStackRoutes.GovernanceList]: undefined;
  [GovernanceStackRoutes.Proposal]: {proposal: ProposalProvider};
  [GovernanceStackRoutes.ProposalDeposit]: {
    proposal: ProposalProvider;
    account: string;
  };
};

const Stack = createNativeStackNavigator<GovernanceStackParamList>();

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

export const GovernanceStack = memo(() => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={GovernanceStackRoutes.GovernanceList}
        component={GovernanceListScreen}
        options={governanceOptions}
      />
      <Stack.Screen
        name={GovernanceStackRoutes.Proposal}
        component={ProposalScreen}
        options={proposalOptions}
      />
      <Stack.Screen
        name={GovernanceStackRoutes.ProposalDeposit}
        component={ProposalDepositStack}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
});
