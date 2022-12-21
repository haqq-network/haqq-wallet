import React, {useCallback} from 'react';

import {ProposalDepositFinish} from '@app/components/proposal-deposit-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const ProposalDepositFinishScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'proposalDepositFinish'>();

  const onDone = useCallback(() => {
    app.emit(Events.onStakingSync);
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <ProposalDepositFinish
      onDone={onDone}
      txhash={params.txhash}
      title={params.title}
      amount={params.amount}
      fee={params.fee}
    />
  );
};
