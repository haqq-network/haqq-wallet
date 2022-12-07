import React, {useEffect} from 'react';

import {FlatList, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {
  CustomHeader,
  Spacer,
  Tag,
  VotingCardActive,
  VotingCardCompleted,
  VotingCompletedStatuses,
  VotingCompletedStatusesKeys,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useCosmos, useProposals} from '@app/hooks';
import {I18N} from '@app/i18n';
import {ProposalsTagType, ProposalsTags} from '@app/types';

export interface HomeGovernanceProps {}

export const HomeGovernance = ({}: HomeGovernanceProps) => {
  const cosmos = useCosmos();
  const {proposals, setStatusFilter, statusFilter} = useProposals();

  useEffect(() => {
    cosmos.syncGovernanceVoting();
  });

  const onSelect = (tag: ProposalsTagType) => () => {
    setStatusFilter(tag[0]);
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
          {ProposalsTags.map(tag => {
            const [tagKey, tagTitle] = tag;
            const tagVariant = statusFilter === tagKey ? 'active' : 'inactive';

            return (
              <Tag
                key={tagKey}
                onPress={onSelect(tag)}
                i18n={tagTitle}
                tagVariant={tagVariant}
              />
            );
          })}
        </ScrollView>
      </View>
      <Spacer height={12} />
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
          } else if (!proposalVotes) {
            return <></>;
          } else {
            const statusKey =
              VotingCompletedStatuses[status as VotingCompletedStatusesKeys];

            return (
              <VotingCardCompleted
                orderNumber={orderNumber}
                isVoted={false}
                endDate={dateEnd}
                startDate={dateStart}
                status={statusKey}
                votes={proposalVotes}
                title={title}
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
