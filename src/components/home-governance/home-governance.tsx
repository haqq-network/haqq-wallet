import React, {useState} from 'react';

import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {
  CustomHeader,
  Spacer,
  Tag,
  VotingCardActive,
  VotingCardCompleted,
  VotingStatus,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
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
          daysLeft={10}
          orderNumber={1}
          minLeft={12}
          hourLeft={23}
          isVoted={false}
          title="Upgrade to v1.2.1"
        />
        <Spacer height={24} />
        <VotingCardActive
          daysLeft={10}
          orderNumber={1}
          minLeft={12}
          hourLeft={23}
          isVoted={true}
          title="Parameter change: Decrease proposal deposit amount to 5"
        />
        <Spacer height={24} />
        <VotingCardCompleted
          orderNumber={1}
          isVoted={true}
          endDate={new Date()}
          startDate={new Date(-4000000)}
          status={VotingStatus.passed}
          votes={{yes: 5, no: 1, abstain: 1, veto: 1}}
          title="VotingCardCompleted"
        />
        <Spacer height={24} />
        <VotingCardCompleted
          orderNumber={1}
          isVoted={false}
          endDate={new Date()}
          startDate={new Date(-4000000)}
          status={VotingStatus.rejected}
          votes={{yes: 5, no: 1, abstain: 1, veto: 1}}
          title="VotingCardCompleted"
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
