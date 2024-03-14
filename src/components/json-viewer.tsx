import React from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';
import JSONTree, {Renderable} from 'react-native-json-tree';

import {Color, createTheme, getColor} from '@app/theme';

interface JsonViewerProps {
  data: Renderable;
  style?: StyleProp<ViewStyle>;
  autoexpand?: boolean;
}

export const JsonViewer = ({
  data,
  style,
  autoexpand = false,
}: JsonViewerProps) => {
  return (
    <View style={[styles.defaultStyle, style]}>
      <JSONTree
        data={data}
        hideRoot
        shouldExpandNode={() => !!autoexpand}
        theme={getTheme()}
      />
    </View>
  );
};

const styles = createTheme({
  defaultStyle: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
});

const getTheme = () => ({
  // TEXT_COLOR
  base07: getColor(Color.textRed1),
  // STRING_COLOR, DATE_COLOR, ITEM_STRING_COLOR
  base0B: getColor(Color.textGreen1),
  // NUMBER_COLOR, BOOLEAN_COLOR
  base09: getColor(Color.textBlue1),
  // UNDEFINED_COLOR, NULL_COLOR, FUNCTION_COLOR, SYMBOL_COLOR
  base08: getColor(Color.textRed1),
  // LABEL_COLOR, ARROW_COLOR
  base0D: getColor(Color.textBase2),
  // ITEM_STRING_EXPANDED_COLOR
  base03: getColor(Color.textYellow1),
});
