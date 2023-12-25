import React, {useCallback, useEffect, useRef, useState} from 'react';

import {observer} from 'mobx-react';

import {Proposal} from '@app/components/proposal';
import {VotingCardDetailRefInterface} from '@app/components/proposal/voting-card-detail';
import {app} from '@app/contexts';
import {awaitForWallet, showModal} from '@app/helpers';
import {depositSum} from '@app/helpers/governance';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  GovernanceStackParamList,
  GovernanceStackRoutes,
} from '@app/screens/HomeStack/GovernanceStack';
import {sendNotification} from '@app/services';
import {ModalType, VoteNamesType} from '@app/types';
import {VOTES} from '@app/variables/votes';

export const ProposalScreen = observer(() => {
  const {proposal} = useTypedRoute<
    GovernanceStackParamList,
    GovernanceStackRoutes.Proposal
  >().params;
  const {navigate} = useTypedNavigation<GovernanceStackParamList>();

  const cardRef = useRef<VotingCardDetailRefInterface>();
  const voteSelectedRef = useRef<VoteNamesType>();
  const [vote, setVote] = useState<VoteNamesType>();
  const [item, setItem] = useState(proposal);
  const [collectedDeposit, setCollectedDeposit] = useState(0);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);

  const cosmos = useCosmos();
  const visible = Wallet.getAllVisible();

  const onDepositSubmit = async (address: string) => {
    navigate(GovernanceStackRoutes.ProposalDeposit, {
      account: address,
      proposal: proposal,
    });
    app.off('wallet-selected-proposal-deposit', onDepositSubmit);
  };

  const onVotedSubmit = useCallback(
    async (address: string) => {
      const opinion = VOTES.find(v => v.name === voteSelectedRef.current);
      const wallet = Wallet.getById(address);
      if (!(wallet && item)) {
        sendNotification(I18N.voteNotRegistered);
        return;
      }
      try {
        const transport = await getProviderInstanceForWallet(wallet);

        await cosmos.vote(
          transport,
          wallet.path!,
          item.proposal_id,
          opinion?.value || 0,
        );

        const prop = await cosmos.getProposalDetails(item.proposal_id);
        setItem(prop.proposal);

        setModalIsVisible(false);
        sendNotification(I18N.voteRegistered);
      } catch (error) {
        sendNotification(I18N.voteNotRegistered);
        Logger.captureException(error, 'proposal.vote');
      }

      setModalIsLoading(false);
    },
    [item, cosmos],
  );

  const onCloseWallets = useCallback(() => setModalIsLoading(false), []);

  useEffect(() => {
    cosmos.getProposalDeposits(item.proposal_id).then(voter => {
      setCollectedDeposit(depositSum(voter));
    });
  }, [item, cosmos]);

  const onVote = async (decision: VoteNamesType) => {
    setModalIsLoading(true);
    voteSelectedRef.current = decision;
    cardRef.current?.setSelected(decision);
    showModal(ModalType.walletsBottomSheet);

    try {
      const address = await awaitForWallet({
        wallets: visible,
        title: I18N.proposalAccountTitle,
        eventSuffix: '-proposal',
      });
      onVotedSubmit(address);
    } catch (e) {
      onCloseWallets();
    }
  };

  const onVoteChange = (decision: VoteNamesType) => {
    cardRef.current?.setSelected(decision);
    setVote(decision);
  };

  useEffect(() => {
    if (item?.status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
      setModalIsVisible(true);
    }
  }, [item]);

  return (
    <Proposal
      cardRef={cardRef}
      vote={vote}
      collectedDeposit={collectedDeposit}
      onDepositSubmit={onDepositSubmit}
      item={item}
      modalIsLoading={modalIsLoading}
      modalIsVisible={modalIsVisible}
      modalOnChangeVote={onVoteChange}
      modalOnVote={onVote}
    />
  );
});
