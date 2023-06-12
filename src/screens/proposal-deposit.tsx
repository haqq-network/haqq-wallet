import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ProposalDepositFinishScreen} from '@app/screens/proposal-deposit-finish';
import {ProposalDepositFormScreen} from '@app/screens/proposal-deposit-form';
import {ProposalDepositPreviewScreen} from '@app/screens/proposal-deposit-preview';
import {Cosmos} from '@app/services/cosmos';
import {ScreenOptionType} from '@app/types';

const ProposalDepositStack = createStackNavigator();

const screenOptionsPreview: ScreenOptionType = {
  title: getText(I18N.proposalDepositPreviewTitle),
  ...hideBack,
  headerRight: undefined,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.proposalDepositFormTitle),
  headerBackHidden: true,
};

const screenOptionsFinish: ScreenOptionType = {
  headerShown: false,
};

export const ProposalDepositScreen = () => {
  const {account, proposal} = useTypedRoute<'proposalDeposit'>().params;

  const fee = parseInt(Cosmos.fee.amount, 10);

  return (
    <ProposalDepositStack.Navigator initialRouteName={'stakingDelegateForm'}>
      <ProposalDepositStack.Group
        screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}>
        <ProposalDepositStack.Screen
          name="proposalDepositForm"
          component={ProposalDepositFormScreen}
          initialParams={{account, proposal}}
          options={screenOptionsForm}
        />
        <ProposalDepositStack.Screen
          name="proposalDepositPreview"
          initialParams={{proposal}}
          component={ProposalDepositPreviewScreen}
          options={screenOptionsPreview}
        />
      </ProposalDepositStack.Group>
      <ProposalDepositStack.Screen
        name="proposalDepositFinish"
        initialParams={{account, fee, proposal}}
        component={ProposalDepositFinishScreen}
        options={screenOptionsFinish}
      />
    </ProposalDepositStack.Navigator>
  );
};
