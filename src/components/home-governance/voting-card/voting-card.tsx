import React from 'react';

import {ProposalsTagKeys} from '@app/types';

import {VotingCardActive} from './voting-card-active';
import {VotingCardCompleted} from './voting-card-completed';

interface VotingCardProps {
  id: number;
  status: ProposalsTagKeys;
  onPress?: (hash: number) => void;
}

export function VotingCard({id, onPress, status}: VotingCardProps) {
  if (status === 'voting' || status === 'deposited') {
    return <VotingCardActive id={id} onPress={onPress} />;
  } else {
    return <VotingCardCompleted id={id} onPress={onPress} />;
  }
}
