import React, {useEffect, useState} from 'react';

import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {
  CustomHeader,
  Spacer,
  Tag,
  VotingCardActive,
  VotingCardCompleted,
  VotingCompletedStatuses,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useCosmos} from '@app/hooks';
import {I18N} from '@app/i18n';

const Tags = {
  all: I18N.homeGovernanceTagAll,
  voting: I18N.homeGovernanceTagVoting,
  passed: I18N.homeGovernanceTagPassed,
  rejected: I18N.homeGovernanceTagRejected,
};

const tagList = Object.values(Tags);

export interface HomeGovernanceProps {}

export const HomeGovernance = ({}: HomeGovernanceProps) => {
  const [selectedTag, setSelectedTag] = useState(tagList[0]);
  const cosmos = useCosmos();

  useEffect(() => {
    cosmos.syncGovernanceVoting();
  });

  const onSelect = (tagName: I18N) => () => {
    setSelectedTag(tagName);
  };

  return (
    <>
      <CustomHeader i18nTitle={I18N.homeGovernance} iconRight="search" />
      <Spacer height={12} />
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}>
          {tagList.map(tagName => {
            const tagVariant = selectedTag === tagName ? 'active' : 'inactive';
            return (
              <Tag
                key={tagName}
                onPress={onSelect(tagName)}
                i18n={tagName}
                tagVariant={tagVariant}
              />
            );
          })}
        </ScrollView>
      </View>
      <Spacer height={12} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}>
        <Spacer height={12} />
        <VotingCardActive
          orderNumber={142}
          daysLeft={10}
          hourLeft={23}
          minLeft={12}
          votes={{yes: 10, no: 20, abstain: 60, veto: 10}}
          isVoted
          title="Upgrade to v1.2.1"
        />
        <Spacer height={24} />
        <VotingCardActive
          orderNumber={342}
          daysLeft={90}
          hourLeft={3}
          minLeft={58}
          votes={{yes: 100, no: 0, abstain: 0, veto: 0}}
          isVoted={true}
          title="Parameter change: Decrease proposal deposit amount to 5"
        />
        <Spacer height={24} />
        <VotingCardActive
          orderNumber={342}
          daysLeft={90}
          hourLeft={3}
          minLeft={58}
          votes={{yes: 100, no: 10, abstain: 0, veto: 0}}
          isVoted={true}
          title="Parameter change: Decrease proposal deposit amount to 5"
          depositNeeds={10000}
          yourDeposit={150}
          depositCollected={9000}
        />
        <Spacer height={24} />
        <VotingCardCompleted
          orderNumber={13222}
          isVoted
          endDate={new Date()}
          startDate={new Date(1653334400000)}
          status={VotingCompletedStatuses.passed}
          votes={{yes: 5, no: 1, abstain: 1, veto: 1}}
          title="Voting Card Completed"
        />
        <Spacer height={24} />
        <VotingCardCompleted
          orderNumber={145331}
          isVoted={false}
          endDate={new Date()}
          startDate={new Date(-1)}
          status={VotingCompletedStatuses.rejected}
          votes={{yes: 5, no: 1, abstain: 1, veto: 1}}
          title="Voting Card Completed 2"
        />
      </ScrollView>
    </>
  );
};

const styles = createTheme({
  tagsContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    flex: 0,
    flexShrink: 0,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
});
