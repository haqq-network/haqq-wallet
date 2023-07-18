import React from 'react';

import {RefreshControl} from 'react-native';
import {Results} from 'realm';

import {BaseNewsItem} from '@app/types';

import {NewsRowList} from './news';

export interface OurNewsProps {
  data: Results<BaseNewsItem> | BaseNewsItem[];
  refreshing: boolean;

  onEndReached(): void;

  onRefresh(): void;

  onPress(id: string): void;
}

export function OurNews({
  data,
  refreshing,
  onEndReached,
  onPress,
  onRefresh,
}: OurNewsProps) {
  return (
    <NewsRowList
      data={data}
      onPress={onPress}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
    />
  );
}
