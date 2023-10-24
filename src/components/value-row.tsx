import React, {useCallback} from 'react';

import {StyleProp, ViewStyle} from 'react-native';

import {DataContent, MenuNavigationButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AwaitValue} from '@app/helpers/await-for-value';

export type ValueRowProps = {
  item: AwaitValue;
  style?: StyleProp<ViewStyle>;
  hideArrow?: boolean;
  checked?: boolean;

  onPress?: (value: AwaitValue) => void;
};

export const ValueRow = ({
  item,
  onPress,
  hideArrow = false,
  checked = false,
  style,
}: ValueRowProps) => {
  const handlePress = useCallback(() => onPress?.(item), [item, onPress]);

  return (
    <MenuNavigationButton
      hideArrow={hideArrow}
      checked={checked}
      onPress={handlePress}
      style={style}>
      <DataContent
        style={styles.info}
        title={item.title}
        subtitle={item.subtitle}
      />
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  info: {
    flex: 1,
  },
});
