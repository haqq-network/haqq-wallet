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
  hash = '',
  onPress,
  proposalVotes,
  dataDifference,
  dateEnd,
  dateStart,
  proposalDepositNeeds = 0,
  status,
  isVoted,
}: Partial<GovernanceVoting> & {onPress?: (hash: string) => void}) {
  if (dataDifference?.isActive) {
    return (
      <VotingCardActive
        hash={hash}
        orderNumber={orderNumber}
        {...dataDifference}
        onPress={onPress}
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
        hash={hash}
        onPress={onPress}
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
