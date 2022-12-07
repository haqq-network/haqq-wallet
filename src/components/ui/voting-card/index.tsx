import React from 'react';

import {GovernanceVoting} from '@app/models/governance-voting';

import {VotingCardActive} from './voting-card-active';
import {
  VotingCardCompleted,
  VotingCompletedStatuses,
  VotingCompletedStatusesKeys,
} from './voting-card-completed';

export function VotingCard({
  orderNumber,
  title = '',
  proposalVotes,
  dataDifference,
  dateEnd,
  dateStart,
  proposalDepositNeeds = 0,
  status,
  isVoted,
}: Partial<GovernanceVoting>) {
  if (dataDifference?.isActive) {
    return (
      <VotingCardActive
        orderNumber={orderNumber}
        {...dataDifference}
        depositNeeds={proposalDepositNeeds}
        isVoted={isVoted}
        title={title}
        votes={proposalVotes}
      />
    );
  } else if (!proposalVotes) {
    return <></>;
  } else {
    const statusKey =
      VotingCompletedStatuses[status as VotingCompletedStatusesKeys];

    return (
      <VotingCardCompleted
        orderNumber={orderNumber}
        isVoted={isVoted}
        endDate={dateEnd}
        startDate={dateStart}
        status={statusKey}
        votes={proposalVotes}
        title={title}
      />
    );
  }
}

export * from './voting-card-active';
export * from './voting-card-completed';
