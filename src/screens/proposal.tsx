import React, {useEffect, useRef, useState} from 'react';

import {Proposal} from '@app/components/proposal';
import {VotingCardDetailRefInterface} from '@app/components/proposal/voting-card-detail';
import {app} from '@app/contexts';
import {captureException, showModal} from '@app/helpers';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useCosmos, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {I18N} from '@app/i18n';
import {GovernanceVoting} from '@app/models/governance-voting';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {VoteNamesType, WalletType} from '@app/types';
import {WINDOW_HEIGHT} from '@app/variables/common';
import {VOTES} from '@app/variables/votes';

export const ProposalScreen = () => {
  const {id} = useTypedRoute<'proposal'>().params;
  const {navigate} = useTypedNavigation();

  const cardRef = useRef<VotingCardDetailRefInterface>();
  const voteSelectedRef = useRef<VoteNamesType>();
  const [vote, setVote] = useState<VoteNamesType>();
  const [item, setItem] = useState(GovernanceVoting.getById(id));
  const [collectedDeposit, setCollectedDeposit] = useState(0);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);

  const cosmos = useCosmos();
  const visible = useWalletsVisible();

  useEffect(() => {
    setItem(GovernanceVoting.getById(id));
  }, [id]);

  const onDepositSubmit = async (address: string) => {
    navigate('proposalDeposit', {
      account: address,
      proposalId: id,
    });
    app.off('wallet-selected-proposal-deposit', onDepositSubmit);
  };

  useEffect(() => {
    const onVotedSubmit = async (address: string) => {
      const opinion = VOTES.findIndex(v => v.name === voteSelectedRef.current);
      const wallet = Wallet.getById(address);
      if (!(wallet && item)) {
        sendNotification(I18N.voteNotRegistered);
        return;
      }
      try {
        const transport = await getProviderInstanceForWallet(wallet);

        const query = cosmos.vote(
          transport,
          wallet.path!,
          item.orderNumber,
          opinion,
        );

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForLedger(transport);
        }

        await query;

        const proposal = await cosmos.getProposalDetails(item.orderNumber);
        GovernanceVoting.create(proposal.proposal);
        setItem(GovernanceVoting.getById(item.orderNumber));

        setModalIsVisible(false);
        sendNotification(I18N.voteRegistered);
      } catch (error) {
        sendNotification(I18N.voteNotRegistered);
        captureException(error, 'proposal.vite');
      }

      setModalIsLoading(false);
    };
    const onCloseWallets = () => setModalIsLoading(false);

    app.on('wallet-selected-proposal', onVotedSubmit);
    app.on('wallet-selected-reject-proposal', onCloseWallets);
    return () => {
      app.off('wallet-selected-proposal', onVotedSubmit);
      app.off('wallet-selected-reject-proposal', onCloseWallets);
    };
  }, [item, cosmos]);

  useEffect(() => {
    if (item) {
      cosmos.getProposalDeposits(item.orderNumber).then(voter => {
        const sum = GovernanceVoting.depositSum(voter);
        setCollectedDeposit(sum);
      });
    }
  }, [item, cosmos]);

  const onVote = (decision: VoteNamesType) => {
    setModalIsLoading(true);
    voteSelectedRef.current = decision;
    cardRef.current?.setSelected(decision);
    showModal('walletsBottomSheet', {
      wallets: visible,
      closeDistance: WINDOW_HEIGHT / 6,
      title: I18N.proposalAccountTitle,
      eventSuffix: '-proposal',
    });
  };

  const onVoteChange = (decision: VoteNamesType) => {
    cardRef.current?.setSelected(decision);
    setVote(decision);
  };

  useEffect(() => {
    if (item?.status === 'voting') {
      setModalIsVisible(true);
    }
  }, [item]);

  if (!(item && item.isValid())) {
    return <></>;
  }

  return (
    <Proposal
      onTouchContent={() => setModalIsVisible(false)}
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
};
