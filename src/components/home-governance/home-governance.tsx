import React, {useEffect, useState} from 'react';

import {FlatList, View} from 'react-native';
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
import {useCosmos, useProposals} from '@app/hooks';
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
  const proposals = useProposals();

  useEffect(() => {
    cosmos.syncGovernanceVoting();
  });

  const onSelect = (tagName: I18N) => () => {
    setSelectedTag(tagName);
  };

  const listHeader = () => <Spacer height={12} />;
  const listSeparator = () => <Spacer height={24} />;

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
      <FlatList
        ListHeaderComponent={listHeader}
        renderItem={({
          item: {
            orderNumber,
            title,
            proposalVotes,
            dataDifference,
            dateEnd,
            dateStart,
            status,
          },
        }) => {
          if (dataDifference.isActive) {
            return (
              <VotingCardActive
                orderNumber={orderNumber}
                {...dataDifference}
                isVoted={false}
                title={title}
                votes={proposalVotes}
              />
            );
          } else {
            return (
              <VotingCardCompleted
                orderNumber={orderNumber}
                isVoted={false}
                endDate={dateEnd}
                startDate={dateStart}
                status={VotingCompletedStatuses[status]}
                votes={{yes: 5, no: 1, abstain: 1, veto: 1}}
                title="Voting Card Completed"
              />
            );
          }
        }}
        ItemSeparatorComponent={listSeparator}
        data={proposals}
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        keyExtractor={item => item.hash}
      />
      <Spacer height={12} />
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
