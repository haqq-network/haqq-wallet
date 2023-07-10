import React, {useCallback} from 'react';

import {FlatList, FlatListProps, ListRenderItem, View} from 'react-native';

import {NewsRow} from '@app/components/news/news-row';
import {PopupContainer} from '@app/components/ui';
import {BaseNewsItem} from '@app/types';

export type NewsRowListProps = {
  data: BaseNewsItem[] | Realm.Results<BaseNewsItem>;
  popupContainerEnabled?: boolean;
  onPress: (id: string) => void;
} & Omit<FlatListProps<BaseNewsItem>, 'data' | 'renderItem'>;

export const NewsRowList = ({
  data,
  onPress,
  popupContainerEnabled = true,
  ...props
}: NewsRowListProps) => {
  const ContainerComponent = popupContainerEnabled ? PopupContainer : View;
  const renderItem: ListRenderItem<BaseNewsItem> = useCallback(
    ({item}) => <NewsRow item={item} onPress={onPress} />,
    [onPress],
  );
  const keyExtractor = useCallback(
    (item: BaseNewsItem) => `news-row-item-${item.id}`,
    [],
  );
  return (
    <ContainerComponent plain>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        {...props}
      />
    </ContainerComponent>
  );
};
