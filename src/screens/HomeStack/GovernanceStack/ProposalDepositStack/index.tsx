import React, {memo, useMemo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  GovernanceStackParamList,
  GovernanceStackRoutes,
  ProposalDepositStackRoutes,
} from '@app/route-types';
import {ProposalDepositFinishScreen} from '@app/screens/HomeStack/GovernanceStack/ProposalDepositStack/proposal-deposit-finish';
import {ProposalDepositFormScreen} from '@app/screens/HomeStack/GovernanceStack/ProposalDepositStack/proposal-deposit-form';
import {ProposalDepositPreviewScreen} from '@app/screens/HomeStack/GovernanceStack/ProposalDepositStack/proposal-deposit-preview';
import {Cosmos} from '@app/services/cosmos';
import {ScreenOptionType} from '@app/types';

const Stack = createNativeStackNavigator();

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

export const ProposalDepositStack = memo(() => {
  const {account, proposal} = useTypedRoute<
    GovernanceStackParamList,
    GovernanceStackRoutes.ProposalDeposit
  >().params;

  const fee = useMemo(() => parseInt(Cosmos.fee.amount, 10), []);

  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={popupScreenOptions}>
        <Stack.Screen
          name={ProposalDepositStackRoutes.ProposalDepositForm}
          component={ProposalDepositFormScreen}
          initialParams={{account, proposal}}
          options={screenOptionsForm}
        />
        <Stack.Screen
          name={ProposalDepositStackRoutes.ProposalDepositPreview}
          initialParams={{proposal}}
          component={ProposalDepositPreviewScreen}
          options={screenOptionsPreview}
        />
      </Stack.Group>
      <Stack.Screen
        name={ProposalDepositStackRoutes.ProposalDepositFinish}
        initialParams={{account, fee, proposal}}
        component={ProposalDepositFinishScreen}
        options={screenOptionsFinish}
      />
    </Stack.Navigator>
  );
});
