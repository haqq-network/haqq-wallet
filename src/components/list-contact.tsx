import React from 'react';

import {FlatList, FlatListProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {AddressRow} from './address-row';
import {PenIcon, Spacer, SwipeableRow, TrashIcon} from './ui';

import {
  LIGHT_GRAPHIC_BASE_3,
  LIGHT_GRAPHIC_RED_1,
  LIGHT_GRAPHIC_SECOND_4,
} from '../variables';

export type ContactFlatListProps = Omit<FlatListProps<any>, 'renderItem'>;

export interface ListContactProps extends ContactFlatListProps {
  onPressRemove: (item: any) => void;
  onPressEdit: (item: any) => void;
}

export const ListContact = ({
  data,
  onPressRemove,
  onPressEdit,
  ...flatListProps
}: ListContactProps) => {
  const {bottom} = useSafeAreaInsets();
  return (
    <FlatList
      data={data}
      ListFooterComponent={() => <Spacer height={bottom} />}
      renderItem={({item}) => (
        <SwipeableRow
          item={item}
          rightActions={[
            {
              icon: <PenIcon color={LIGHT_GRAPHIC_BASE_3} />,
              backgroundColor: LIGHT_GRAPHIC_SECOND_4,
              onPress: onPressEdit,
              key: 'edit',
            },
            {
              icon: <TrashIcon color={LIGHT_GRAPHIC_BASE_3} />,
              backgroundColor: LIGHT_GRAPHIC_RED_1,
              onPress: onPressRemove,
              key: 'remove',
            },
          ]}>
          <AddressRow item={item} />
        </SwipeableRow>
      )}
      keyExtractor={(item, id) => String(id)}
      {...flatListProps}
    />
  );
};
