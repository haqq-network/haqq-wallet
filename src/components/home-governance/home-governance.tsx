import React from 'react';

import {FlatList, View} from 'react-native';

import {ProposalVotingEmpty} from '@app/components/proposal-voting-empty';
import {
  CustomHeader,
  Loading,
  Spacer,
  Tag,
  VotingCard,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useProposals} from '@app/hooks';
import {I18N} from '@app/i18n';
import {ProposalsTagKeys, ProposalsTagType, ProposalsTags} from '@app/types';

export interface HomeGovernanceProps {
  onPressCard?: (hash: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
}

export const HomeGovernance = ({
  onPressCard,
  onRefresh,
  loading,
  refreshing,
}: HomeGovernanceProps) => {
  const {proposals, setStatusFilter, statusFilter} = useProposals();

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
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          data={ProposalsTags}
          keyExtractor={item => item[0]}
          renderItem={({item}) => {
            const [tagKey, tagTitle] = item;
            const tagVariant = statusFilter === tagKey ? 'active' : 'inactive';

            return (
              <Tag
                key={tagKey}
                onPress={onSelect(item)}
                i18n={tagTitle}
                tagVariant={tagVariant}
              />
            );
          }}
        />
      </View>
      <Spacer height={12} />
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          ListEmptyComponent={ProposalVotingEmpty}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={listHeader}
          renderItem={({item}) => (
            <VotingCard
              hash={item.hash}
              onPress={onPressCard}
              status={item.status as ProposalsTagKeys}
            />
          )}
          ItemSeparatorComponent={listSeparator}
          data={proposals}
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
          keyExtractor={item => item.hash}
        />
      )}
      <Spacer height={12} />
    </>
  );
};

const styles = createTheme({
  tagsContainer: {
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
});
