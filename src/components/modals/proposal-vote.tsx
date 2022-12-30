import React, {useState} from 'react';

import {
  BottomPopupContainer,
  PopupProposalVote,
} from '@app/components/bottom-popups';
import {app} from '@app/contexts';
import {hideModal} from '@app/helpers';
import {VoteNamesType} from '@app/types';

export interface ProposalVoteProps {
  eventSuffix?: string;
  closeOnPressOut?: boolean;
}

export function ProposalVote({eventSuffix = ''}: ProposalVoteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onPressVote = (vote: VoteNamesType) => {
    setIsLoading(true);
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
          isLoading={isLoading}
          onChangeVote={onChangeVote}
          onSubmitVote={vote => {
            const onLoadingEnd = () => {
              setIsLoading(false);
              onClose(hideModal);
              app.off(`proposal-vote-loading-end${eventSuffix}`, onLoadingEnd);
            };
            app.on(`proposal-vote-loading-end${eventSuffix}`, onLoadingEnd);
            onPressVote(vote);
          }}
        />
      )}
    </BottomPopupContainer>
  );
}
