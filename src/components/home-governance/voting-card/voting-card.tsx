import React from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';

import {VotingCardActive} from './voting-card-active';
import {VotingCardCompleted} from './voting-card-completed';

interface VotingCardProps {
  item: Proposal;
  onPress: (proposal: Proposal) => void;
}

export function VotingCard({item, onPress}: VotingCardProps) {
  if (
    item.status === 'PROPOSAL_STATUS_VOTING_PERIOD' ||
    item.status === 'PROPOSAL_STATUS_DEPOSIT_PERIOD'
  ) {
    return <VotingCardActive item={item} onPress={onPress} />;
  } else {
    return <VotingCardCompleted item={item} onPress={onPress} />;
  }
}
