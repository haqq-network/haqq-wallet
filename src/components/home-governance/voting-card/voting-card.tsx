import React from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';

import {VotingCardActive} from './voting-card-active';
import {VotingCardCompleted} from './voting-card-completed';

interface VotingCardProps {
  item: Proposal;
  onPress: (proposal: Proposal) => void;
}

export function VotingCard({item, onPress}: VotingCardProps) {
  console.log('item', item);
  if (item.status === 'voting' || item.status === 'deposited') {
    return <VotingCardActive item={item} onPress={onPress} />;
  } else {
    return <VotingCardCompleted item={item} onPress={onPress} />;
  }
}
