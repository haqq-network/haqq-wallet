import React from 'react';

import {FlatList, FlatListProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {AddressRow} from '@app/components/address-row';
import {Icon, Spacer, SwipeableRow} from '@app/components/ui';
import {useTheme} from '@app/hooks';

export type ContactFlatListProps = Omit<FlatListProps<any>, 'renderItem'>;

export interface ListContactProps extends ContactFlatListProps {
  onPressRemove: (item: any) => void;
  onPressEdit: (item: any) => void;
  onPressAddress?: (item: string) => void;
}

export const ListContact = ({
  data,
  onPressRemove,
  onPressEdit,
  onPressAddress,
  ...flatListProps
}: ListContactProps) => {
  const {bottom} = useSafeAreaInsets();
  const {colors} = useTheme();
  const listFooterComponentRender = () => <Spacer height={bottom} />;
  return (
    <FlatList
      data={data}
      ListFooterComponent={listFooterComponentRender}
      renderItem={({item}) => (
        <SwipeableRow
          item={item}
          rightActions={[
            {
              icon: <Icon name="pen" color={Color.graphicBase3} />,
              backgroundColor: colors.graphicSecond4,
              onPress: onPressEdit,
              key: 'edit',
            },
            {
              icon: <Icon name="trash" color={Color.graphicBase3} />,
              backgroundColor: colors.graphicRed1,
              onPress: onPressRemove,
              key: 'remove',
            },
          ]}>
          <AddressRow item={item} onPress={onPressAddress} />
        </SwipeableRow>
      )}
      keyExtractor={(item, id) => String(id)}
      {...flatListProps}
    />
  );
};
