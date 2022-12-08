import React from 'react';

import {ProposalsTagKeys} from '@app/types';

import {VotingCardActive} from './voting-card-active';
import {VotingCardCompleted} from './voting-card-completed';

interface VotingCardProps {
  hash: string;
  status: ProposalsTagKeys;
  onPress?: (hash: string) => void;
}

export function VotingCard({hash, onPress, status}: VotingCardProps) {
  if (status === 'voting' || status === 'deposited') {
    return <VotingCardActive hash={hash} onPress={onPress} />;
  } else {
    return <VotingCardCompleted hash={hash} onPress={onPress} />;
  }
}

export * from './voting-card-active';
export * from './voting-card-completed';
export * from './voting-card-detail';
