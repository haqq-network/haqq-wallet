import React from 'react';

import {FlatList, View} from 'react-native';

import {ProposalVotingEmpty} from '@app/components/proposal-voting-empty';
import {CustomHeader, Loading, Spacer, Tag} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {
  ProposalsCroppedList,
  ProposalsTagKeys,
  ProposalsTagType,
  ProposalsTags,
} from '@app/types';

import {VotingCard} from './voting-card';

export interface HomeGovernanceProps {
  proposals: ProposalsCroppedList;
  statusFilter: ProposalsTagKeys;
  onPressCard?: (id: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  onSelect?: (tag: ProposalsTagType) => () => void;
}

export const HomeGovernance = ({
  proposals,
  statusFilter,
  onPressCard,
  onRefresh,
  refreshing,
  loading,
  onSelect,
}: HomeGovernanceProps) => {
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
                onPress={onSelect?.(item)}
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
              id={item.id}
              onPress={onPressCard}
              status={item.status as ProposalsTagKeys}
            />
          )}
          ItemSeparatorComponent={listSeparator}
          data={proposals}
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
          keyExtractor={item => String(item.id)}
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
