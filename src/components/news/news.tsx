import React from 'react';

import {FlatList} from 'react-native';
import {Results} from 'realm';

import {NewsRow} from '@app/components/news/news-row';
import {PopupContainer} from '@app/components/ui';
import {News as NewsModel} from '@app/models/news';

export type NewsProps = {
  rows: Results<NewsModel>;
  onPress: (id: string) => void;
};

export const News = ({rows, onPress}: NewsProps) => {
  return (
    <PopupContainer plain>
      <FlatList
        data={rows}
        renderItem={({item}) => <NewsRow item={item} onPress={onPress} />}
      />
    </PopupContainer>
  );
};
