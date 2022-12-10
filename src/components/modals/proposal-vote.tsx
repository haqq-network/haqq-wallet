import React from 'react';

import {
  BottomPopupContainer,
  PopupProposalVote,
} from '@app/components/bottom-popups';
import {hideModal} from '@app/helpers';
import {useApp} from '@app/hooks';
import {VoteNamesType} from '@app/types';

export interface ProposalVoteProps {
  eventSuffix?: string;
  closeOnPressOut?: boolean;
}

export function ProposalVote({eventSuffix = ''}: ProposalVoteProps) {
  const app = useApp();

  const onPressVote = (vote: VoteNamesType) => () => {
    hideModal();
    app.emit(`proposal-vote${eventSuffix}`, vote);
  };

  const onPressOutContent = () => {
    app.emit(`proposal-vote-close${eventSuffix}`);
    hideModal();
  };

  const onChangeVote = (vote: VoteNamesType) => {
    app.emit(`proposal-vote-change${eventSuffix}`, vote);
  };

  return (
    <BottomPopupContainer
      closeOnPressOut={true}
      onPressOutContent={onPressOutContent}
      transparent>
      {onClose => (
        <PopupProposalVote
          onChangeVote={onChangeVote}
          onSubmitVote={vote => onClose(onPressVote(vote))}
        />
      )}
    </BottomPopupContainer>
  );
}
