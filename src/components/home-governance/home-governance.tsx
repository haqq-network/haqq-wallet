import React, {useEffect} from 'react';

import {FlatList, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {CustomHeader, Spacer, Tag, VotingCard} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useCosmos, useProposals} from '@app/hooks';
import {I18N} from '@app/i18n';
import {ProposalsTagType, ProposalsTags} from '@app/types';

export interface HomeGovernanceProps {
  onPressCard?: (hash: string) => void;
}

export const HomeGovernance = ({onPressCard}: HomeGovernanceProps) => {
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
        renderItem={({item}) => (
          <VotingCard
            hash={item.hash}
            orderNumber={item.orderNumber}
            onPress={onPressCard}
            status={item.status}
            proposalDepositNeeds={item.proposalDepositNeeds}
            title={item.title}
            dateEnd={item.dateEnd}
            dateStart={item.dateStart}
            dataDifference={item.dataDifference}
            proposalVotes={item.proposalVotes}
            isVoted={item.isVoted}
          />
        )}
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
