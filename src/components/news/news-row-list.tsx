import React from 'react';

import {FlatList, RefreshControlProps, View} from 'react-native';

import {NewsRow} from '@app/components/news/news-row';
import {PopupContainer} from '@app/components/ui';
import {BaseNewsItem} from '@app/types';

export type NewsRowListProps = {
  data: BaseNewsItem[] | Realm.Results<BaseNewsItem>;
  onPress: (id: string) => void;
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
  popupContainerEnabled?: boolean;
  renderListHeaderComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
};

export const NewsRowList = ({
  data,
  onPress,
  refreshControl,
  renderListHeaderComponent,
  popupContainerEnabled = true,
}: NewsRowListProps) => {
  const ContainerComponent = popupContainerEnabled ? PopupContainer : View;
  return (
    <ContainerComponent plain>
      <FlatList
        data={data}
        refreshControl={refreshControl}
        renderItem={({item}) => <NewsRow item={item} onPress={onPress} />}
        ListHeaderComponent={renderListHeaderComponent}
      />
    </ContainerComponent>
  );
};
