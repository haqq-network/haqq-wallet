import React, {useCallback, useMemo} from 'react';

import {FlatList, ListRenderItem, Platform, View} from 'react-native';

import {ProposalVotingEmpty} from '@app/components/proposal-voting-empty';
import {CustomHeader, Loading, Spacer, Tag} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {
  ProposalsCroppedItem,
  ProposalsCroppedList,
  ProposalsTagKeys,
} from '@app/types';
import {ProposalsTagType, ProposalsTags} from '@app/variables/proposal';

import {VotingCard} from './voting-card';

export interface HomeGovernanceProps {
  proposals: ProposalsCroppedList;
  statusFilter: ProposalsTagKeys;
  onPressCard?: (id: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  onSelect?: (tag: ProposalsTagType) => () => void;
  onSearchChange?: (text: string) => void;
}

export const HomeGovernance = ({
  proposals,
  statusFilter,
  onPressCard,
  onRefresh,
  onSearchChange,
  refreshing,
  loading,
  onSelect,
}: HomeGovernanceProps) => {
  const listHeader = useCallback(() => <Spacer height={12} />, []);
  const listSeparator = useCallback(() => <Spacer height={24} />, []);
  const keyExtractorProposalsItem = useCallback(
    (item: ProposalsCroppedItem) => String(item.id),
    [],
  );
  const renderProposalsItem: ListRenderItem<ProposalsCroppedItem> = useCallback(
    ({item}) => (
      <VotingCard
        id={item.id}
        onPress={onPressCard}
        status={item.status as ProposalsTagKeys}
      />
    ),
    [onPressCard],
  );
  const renderProposalTagItem: ListRenderItem<ProposalsTagType> = useCallback(
    ({item}) => {
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
    },
    [onSelect, statusFilter],
  );
  const keyExtractorProposalTag = useCallback(
    (item: ProposalsTagType) => item[0],
    [],
  );

  const headerMarginTop = useMemo(
    () =>
      Platform.select({
        android: 0,
      }),
    [],
  );

  return (
    <>
      <CustomHeader
        onSearchChange={onSearchChange}
        title={I18N.homeGovernance}
        iconRight="search"
        marginTop={headerMarginTop}
      />
      <Spacer height={12} />
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          data={ProposalsTags}
          keyExtractor={keyExtractorProposalTag}
          renderItem={renderProposalTagItem}
        />
      </View>
      <Spacer height={12} />
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          ListEmptyComponent={
            <ProposalVotingEmpty votingCategory={statusFilter} />
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={listHeader}
          renderItem={renderProposalsItem}
          ItemSeparatorComponent={listSeparator}
          data={proposals}
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyExtractor={keyExtractorProposalsItem}
        />
      )}
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
  scrollContent: {
    paddingBottom: 12,
  },
});
