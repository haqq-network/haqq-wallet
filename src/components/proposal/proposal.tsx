import React, {useEffect, useMemo} from 'react';

import {Proposal as ProposalType} from '@evmos/provider/dist/rest/gov';
import {format} from 'date-fns';
import Decimal from 'decimal.js';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {
  Badge,
  Icon,
  InfoBlock,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {proposalDepositNeeds, yesPercent} from '@app/helpers/governance';
import {I18N} from '@app/i18n';
import {VoteNamesType} from '@app/types';
import {NUM_PRECISION, WEI} from '@app/variables/common';
import {ProposalsTags} from '@app/variables/proposal';

import {ProposalVote} from './proposal-vote';
import {
  VotingCardDetail,
  VotingCardDetailRefInterface,
} from './voting-card-detail';

interface ProposalProps {
  item: ProposalType;
  onDepositSubmit?: (address: string) => Promise<void>;
  collectedDeposit: number;
  vote?: VoteNamesType;
  cardRef: React.RefObject<VotingCardDetailRefInterface | undefined>;
  modalIsLoading: boolean;
  modalIsVisible: boolean;
  modalOnVote: (vote: VoteNamesType) => void;
  modalOnChangeVote: (vote: VoteNamesType) => void;
}

export function Proposal({
  item,
  collectedDeposit /*, onDepositSubmit*/,
  vote,
  cardRef,
  modalIsLoading,
  modalOnVote,
  modalOnChangeVote,
  modalIsVisible,
}: ProposalProps) {
  const {bottom} = useSafeAreaInsets();

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

  const yp = useMemo(() => yesPercent(item), [item]);
  const pdn = useMemo(() => proposalDepositNeeds(item), [item]);

  const deposit = useMemo(() => {
    return cleanNumber(
      item.total_deposit
        .reduce((memo, curr) => memo.plus(curr.amount), new Decimal(0))
        .div(WEI)
        .toFixed(NUM_PRECISION + 1),
    );
  }, [item]);

  useEffect(() => {
    item && cardRef.current?.updateNotEnoughProgress(yp / 100);
    cardRef.current?.updateDepositProgress(collectedDeposit / (pdn ?? 0));
  }, [cardRef, collectedDeposit, item, pdn, yp]);

  const badgeStatus = useMemo(
    () => ProposalsTags.find(tag => tag[0] === item?.status),
    [item?.status],
  );

  const type = useMemo(() => {
    switch (item.content['@type']) {
      case '/cosmos.params.v1beta1.ParameterChangeProposal':
        return I18N.proposalTypeParameterChangeProposal;
      case '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal':
        return I18N.proposalTypeParameterChangeProposal;
      case '/ibc.core.client.v1.ClientUpdateProposal':
        return I18N.proposalTypeClientUpdateProposal;
      default:
        return I18N.proposalTypeUnknown;
    }
  }, [item]);

  const isDeposited = useMemo(() => {
    return item.status === 'PROPOSAL_STATUS_DEPOSIT_PERIOD';
  }, [item]);

  return (
    <>
      <PopupContainer
        style={[styles.container, modalIsVisible && styles.voting]}>
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
          #{item.proposal_id}
        </Text>
        <Spacer height={2} />
        <Text center t5>
          {item.content.title}
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
            <Text t14 i18n={type} />
          </View>
          <Spacer width={16} />
          <View style={styles.block}>
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.proposalTotalDeposit}
            />
            <Spacer height={4} />
            <Text t14 i18n={I18N.amountISLM} i18params={{amount: deposit}} />
          </View>
        </View>
        <View style={styles.block}>
          <Text t14 color={Color.textBase2} i18n={I18N.proposalDescription} />
          <Spacer height={4} />
          <Text t14>{item.content.description}</Text>
        </View>
        {'changes' in item.content && (
          <>
            <Spacer height={24} />
            <Text t9 i18n={I18N.proposalChanges} />
            <Spacer height={12} />
            <View style={styles.codeBlock}>
              <Text t14 color={Color.textBase1}>
                {JSON.stringify(item.content.changes, null, 4)}
              </Text>
            </View>
          </>
        )}
        {'plan' in item.content && (
          <>
            <Spacer height={24} />
            <Text t9 i18n={I18N.proposalPlan} />
            <Spacer height={12} />
            <View style={styles.codeBlock}>
              <Text t14 color={Color.textBase1}>
                {JSON.stringify(item.content.plan, null, 4)}
              </Text>
            </View>
          </>
        )}
        <Spacer height={24} />
        <Text t9 i18n={I18N.proposalDate} />
        <View style={styles.row}>
          <View style={styles.block}>
            <Text t14 color={Color.textBase2} i18n={I18N.proposalCreatedAt} />
            <Spacer height={4} />
            <Text t14>
              {item.submit_time &&
                format(new Date(item.submit_time), 'dd MMM yyyy, H:mm')}
            </Text>
            <Spacer height={8} />
            <Text t14 color={Color.textBase2} i18n={I18N.proposalVoteStart} />
            <Spacer height={4} />
            <Text t14>
              {item.voting_start_time &&
                format(new Date(item.voting_start_time), 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
          <Spacer width={16} />
          <View style={styles.block}>
            <Text t14 color={Color.textBase2} i18n={I18N.proposalDepositEnd} />
            <Spacer height={4} />
            <Text t14>
              {item.deposit_end_time &&
                format(new Date(item.deposit_end_time), 'dd MMM yyyy, H:mm')}
            </Text>
            <Spacer height={8} />
            <Text t14 color={Color.textBase2} i18n={I18N.proposalVoteEnd} />
            <Spacer height={4} />
            <Text t14>
              {item.voting_end_time &&
                format(new Date(item.voting_end_time), 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
        </View>
        <Spacer height={(isDeposited ? 0 : bottom) + 28} />

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
      </PopupContainer>
      <ProposalVote
        isLoading={modalIsLoading}
        modalIsVisible={modalIsVisible}
        onChangeVote={modalOnChangeVote}
        onVote={modalOnVote}
      />
    </>
  );
}

const styles = createTheme({
  container: {
    paddingTop: 24,
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
  voting: {paddingBottom: 120},
  // depositButtonContainer: {
  //   padding: 20,
  // },
});
