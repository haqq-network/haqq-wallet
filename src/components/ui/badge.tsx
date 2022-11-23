import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';

export type BadgeProps = {
  text: string;
  color: string;
  style?: StyleProp<ViewStyle>;
};
export const Badge = ({text, color, style}: BadgeProps) => {
  const container = useMemo(
    () => [styles.container, {backgroundColor: color}, style],
    [color, style],
  );
  return (
    <View style={container}>
      <Text t13 color={getColor(Color.textBase3)}>
        {text}
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
