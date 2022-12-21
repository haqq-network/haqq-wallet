import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useWindowDimensions} from 'react-native';

import {Proposal} from '@app/components/proposal';
import {VotingCardDetailRefInterface} from '@app/components/proposal/voting-card-detail';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {
  useCosmos,
  useTypedNavigation,
  useTypedRoute,
  useWalletsList,
} from '@app/hooks';
import {I18N} from '@app/i18n';
import {GovernanceVoting} from '@app/models/governance-voting';
import {Wallet} from '@app/models/wallet';
import {VoteNamesType} from '@app/types';
import {VOTES} from '@app/variables/votes';

export const ProposalScreen = () => {
  const {id} = useTypedRoute<'proposal'>().params;
  const {navigate} = useTypedNavigation();
  const cosmos = useCosmos();

  const cardRef = useRef<VotingCardDetailRefInterface>();
  const voteSelectedRef = useRef<VoteNamesType>();
  const {visible} = useWalletsList();
  const closeDistance = useWindowDimensions().height / 6;

  const [vote, setVote] = useState<VoteNamesType>();
  const [collectedDeposit, setCollectedDeposit] = useState(0);

  const item = useMemo(() => {
    return GovernanceVoting.getById(id);
  }, [id]);

  const onDepositSubmit = async (address: string) => {
    navigate('proposalDeposit', {
      account: address,
      proposalId: id,
    });
    app.removeListener('wallet-selected-proposal-deposit', onDepositSubmit);
  };

  const onDeposit = () => {
    showModal('wallets-bottom-sheet', {
      wallets: visible,
      closeDistance,
      title: I18N.proposalAccountTitle,
      eventSuffix: '-proposal-deposit',
    });
    if (onDepositSubmit) {
      app.addListener('wallet-selected-proposal-deposit', onDepositSubmit);
    }
  };

  useEffect(() => {
    const onVotedSubmit = async (address: string) => {
      const opinion = VOTES.findIndex(v => v.name === voteSelectedRef.current);
      const wallet = Wallet.getById(address);
      if (!(wallet && item)) {
        return;
      }
      await cosmos.vote(wallet.transport, item.orderNumber, opinion);
    };
    app.addListener('wallet-selected-proposal', onVotedSubmit);
    return () => {
      app.removeListener('wallet-selected-proposal', onVotedSubmit);
    };
  }, [item, cosmos]);

  useEffect(() => {
    if (item?.status === 'voting') {
      showModal('proposal-vote', {eventSuffix: '-proposal'});

      const onVote = (decision: VoteNamesType) => {
        voteSelectedRef.current = decision;
        cardRef.current?.setSelected(decision);
        showModal('wallets-bottom-sheet', {
          wallets: visible,
          closeDistance,
          title: I18N.proposalAccountTitle,
          eventSuffix: '-proposal',
        });
      };

      const onVoteChange = (decision: VoteNamesType) => {
        cardRef.current?.setSelected(decision);
        setVote(decision);
      };

      app.on('proposal-vote-proposal', onVote);
      app.on('proposal-vote-change-proposal', onVoteChange);
      return () => {
        app.off('proposal-vote-proposal', onVote);
        app.off('proposal-vote-change-proposal', onVoteChange);
      };
    }
  }, [item, closeDistance, visible]);

  useEffect(() => {
    if (item?.orderNumber) {
      cosmos.getProposalDeposits(item.orderNumber).then(voter => {
        const sum = GovernanceVoting.depositSum(voter);
        setCollectedDeposit(sum);
      });
      //   (async () => {
      //     const details = await cosmos.getProposalDetails(id);
      //     // setDetails({

      //     // })
      //     console.log('🚀 - details', JSON.stringify(response.proposal));
      //   })();
    }
  }, [item?.orderNumber, cosmos]);

  if (!item) {
    return <></>;
  }

  return (
    <Proposal
      vote={vote}
      onDeposit={onDeposit}
      collectedDeposit={collectedDeposit}
      item={item}
    />
  );
};
