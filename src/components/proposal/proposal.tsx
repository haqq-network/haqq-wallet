import React, {useEffect, useMemo, useRef, useState} from 'react';

import {format} from 'date-fns';
import {ScrollView, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Badge, Icon, InfoBlock, Spacer, Text} from '@app/components/ui';
import {createTheme, showModal} from '@app/helpers';
import {useApp, useCosmos, useWalletsList} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  GovernanceVoting,
  ProposalRealmType,
} from '@app/models/governance-voting';
import {Wallet} from '@app/models/wallet';
import {VoteNamesType} from '@app/types';
import {ProposalsTags} from '@app/variables/proposal';
import {VOTES} from '@app/variables/votes';

import {
  VotingCardDetail,
  VotingCardDetailRefInterface,
} from './voting-card-detail';

interface ProposalProps {
  item: ProposalRealmType;
  onDepositSubmit?: (address: string) => Promise<void>;
}

export function Proposal({item /*, onDepositSubmit*/}: ProposalProps) {
  const {bottom} = useSafeAreaInsets();
  const cardRef = useRef<VotingCardDetailRefInterface>();
  const voteSelectedRef = useRef<VoteNamesType>();
  const [vote, setVote] = useState<VoteNamesType>();
  const [collectedDeposit, setCollectedDeposit] = useState(0);

  const cosmos = useCosmos();
  const app = useApp();
  const {visible} = useWalletsList();
  const closeDistance = useWindowDimensions().height / 6;

  // const onDeposit = () => {
  //   showModal('wallets-bottom-sheet', {
  //     wallets: visible,
  //     closeDistance,
  //     title: I18N.proposalAccountTitle,
  //     eventSuffix: '-proposal-deposit',
  //   });
  //   if (onDepositSubmit) {
  //     app.addListener('wallet-selected-proposal-deposit', onDepositSubmit);
  //   }
  // };

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
  }, [app, item, cosmos]);

  useEffect(() => {
    item && cardRef.current?.updateNotEnoughProgress(item.yesPercent / 100);
    cardRef.current?.updateDepositProgress(
      collectedDeposit / (item?.proposalDepositNeeds ?? 0),
    );
  }, [collectedDeposit, item]);

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
  }, [app, item, closeDistance, visible]);

  useEffect(() => {
    cosmos.getProposalDeposits(item.orderNumber).then(voter => {
      const sum = GovernanceVoting.depositSum(voter);
      setCollectedDeposit(sum);
    });
  }, [item.orderNumber, cosmos]);

  const badgeStatus = useMemo(
    () => ProposalsTags.find(tag => tag[0] === item?.status),
    [item?.status],
  );

  if (!item) {
    return <></>;
  }

  const {orderNumber, title, description, isDeposited} = item;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Spacer height={24} />
        {badgeStatus && (
          <Badge
            center
            i18n={badgeStatus[1]}
            labelColor={badgeStatus[2]}
            textColor={badgeStatus[3]}
            iconLeftName={badgeStatus[4]}
          />
        )}
        <Spacer height={16} />
        <Text center color={Color.textBase2} t14>
          #{orderNumber}
        </Text>
        <Spacer height={2} />
        <Text center t5>
          {title}
        </Text>
        <Spacer height={24} />
        <VotingCardDetail
          totalCollected={collectedDeposit}
          yourVote={vote}
          ref={cardRef}
          item={item}
        />
        {isDeposited && (
          <InfoBlock
            style={styles.infoBlockMargin}
            warning
            icon={<Icon name="warning" color={Color.textYellow1} />}
            i18n={I18N.proposalDepositAttention}
          />
        )}
        <Spacer height={24} />
        <Text t9 i18n={I18N.proposalInfo} />

        <View style={styles.row}>
          <View style={styles.block}>
            <Text t14 color={Color.textBase2} i18n={I18N.proposalType} />
            <Spacer height={4} />
            <Text t14>PASS</Text>
          </View>
          <Spacer width={16} />
          <View style={styles.block}>
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.proposalTotalDeposit}
            />
            <Spacer height={4} />
            <Text t14>PASS</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text t14 color={Color.textBase2} i18n={I18N.proposalDescription} />
          <Spacer height={4} />
          <Text t14>{description}</Text>
        </View>

        <Spacer height={24} />
        <Text t9 i18n={I18N.proposalChanges} />
        <Spacer height={12} />
        <View style={styles.codeBlock}>
          <Text t14 color={Color.textBase1}>
            {`[
  PASS
]`}
          </Text>
        </View>

        <Spacer height={24} />
        <Text t9 i18n={I18N.proposalDate} />
        <View style={styles.row}>
          <View style={styles.block}>
            <Text t14 color={Color.textBase2} i18n={I18N.proposalCreatedAt} />
            <Spacer height={4} />
            <Text t14>
              {item.createdAt && format(item.createdAt, 'dd MMM yyyy, H:mm')}
            </Text>
            <Spacer height={8} />
            <Text t14 color={Color.textBase2} i18n={I18N.proposalVoteStart} />
            <Spacer height={4} />
            <Text t14>
              {item.dateStart && format(item.dateStart, 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
          <Spacer width={16} />
          <View style={styles.block}>
            <Text t14 color={Color.textBase2} i18n={I18N.proposalDepositEnd} />
            <Spacer height={4} />
            <Text t14>
              {item.depositEnd && format(item.depositEnd, 'dd MMM yyyy, H:mm')}
            </Text>
            <Spacer height={8} />
            <Text t14 color={Color.textBase2} i18n={I18N.proposalVoteEnd} />
            <Spacer height={4} />
            <Text t14>
              {item.dateEnd && format(item.dateEnd, 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
        </View>
        <Spacer height={(isDeposited ? 0 : bottom) + 28} />
      </ScrollView>
      {/* {isDeposited && (
        <View style={styles.depositButtonContainer}>
          <Button
            variant={ButtonVariant.contained}
            onPress={onDeposit}
            i18n={I18N.proposalDeposit}
          />
          <Spacer height={bottom} />
        </View>
      )} */}
    </>
  );
}

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  block: {
    marginTop: 12,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  codeBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    padding: 12,
  },
  infoBlockMargin: {
    marginTop: 8,
  },
  // depositButtonContainer: {
  //   padding: 20,
  // },
});
