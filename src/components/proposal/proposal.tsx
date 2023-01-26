import React, {useEffect, useMemo} from 'react';

import {format} from 'date-fns';
import {Pressable, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Badge, Icon, InfoBlock, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ProposalRealmType} from '@app/models/governance-voting';
import {VoteNamesType} from '@app/types';
import {ProposalsTags} from '@app/variables/proposal';

import {ProposalVote} from './proposal-vote';
import {
  VotingCardDetail,
  VotingCardDetailRefInterface,
} from './voting-card-detail';

interface ProposalProps {
  item?: ProposalRealmType;
  onDepositSubmit?: (address: string) => Promise<void>;
  collectedDeposit: number;
  vote?: VoteNamesType;
  cardRef: React.RefObject<VotingCardDetailRefInterface | undefined>;
  modalIsLoading: boolean;
  modalIsVisible: boolean;
  onTouchContent: () => void;
  modalOnVote: (vote: VoteNamesType) => void;
  modalOnChangeVote: (vote: VoteNamesType) => void;
}

export function Proposal({
  item,
  collectedDeposit /*, onDepositSubmit*/,
  vote,
  cardRef,
  modalIsLoading,
  onTouchContent,
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

  useEffect(() => {
    item && cardRef.current?.updateNotEnoughProgress(item.yesPercent / 100);
    cardRef.current?.updateDepositProgress(
      collectedDeposit / (item?.proposalDepositNeeds ?? 0),
    );
  }, [cardRef, collectedDeposit, item]);

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
        <Pressable onPress={onTouchContent}>
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
              <Text
                t14
                color={Color.textBase2}
                i18n={I18N.proposalDepositEnd}
              />
              <Spacer height={4} />
              <Text t14>
                {item.depositEnd &&
                  format(item.depositEnd, 'dd MMM yyyy, H:mm')}
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
        </Pressable>
      </ScrollView>
      <ProposalVote
        isLoading={modalIsLoading}
        modalIsVisible={modalIsVisible}
        onChangeVote={modalOnChangeVote}
        onVote={modalOnVote}
      />
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
