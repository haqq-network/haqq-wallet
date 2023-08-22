import React, {memo, useCallback} from 'react';

import {ProposalDepositFinish} from '@app/components/proposal-deposit-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  ProposalDepositStackParamList,
  ProposalDepositStackRoutes,
} from '@app/screens/HomeStack/GovernanceStack/ProposalDepositStack';

export const ProposalDepositFinishScreen = memo(() => {
  const navigation = useTypedNavigation<ProposalDepositStackParamList>();
  const route = useTypedRoute<
    ProposalDepositStackParamList,
    ProposalDepositStackRoutes.ProposalDepositFinish
  >();

  const onDone = useCallback(() => {
    app.emit(Events.onStakingSync);
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <ProposalDepositFinish
      onDone={onDone}
      txhash={route.params.txhash}
      proposal={route.params.proposal}
      amount={route.params.amount}
      fee={route.params.fee}
    />
  );
});
