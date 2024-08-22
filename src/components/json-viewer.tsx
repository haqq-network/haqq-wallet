/* eslint-disable react/no-unstable-nested-components */
import React from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {StyleProp, View, ViewStyle} from 'react-native';
import JSONTree, {Renderable} from 'react-native-json-tree';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {Text, TextVariant} from './ui';

interface JsonViewerProps {
  data: Renderable;
  style?: StyleProp<ViewStyle>;
  autoexpand?: boolean;
}

const CustomNode = ({value}: {value: any}) => {
  const handleAddressPress = React.useCallback(() => {
    vibrate(HapticEffects.impactLight);
    Clipboard.setString(value);
    sendNotification(I18N.notificationCopied);
  }, [value]);

  if (AddressUtils.isValidAddress(value)) {
    const [part0, part1, part2] = AddressUtils.splitAddress(value);
    return (
      <Text
        variant={TextVariant.t13}
        color={Color.textBlue1}
        selectable
        onPress={handleAddressPress}>
        "{part0}
        <Text variant={TextVariant.t14} color={Color.textBlue1}>
          {part1}
        </Text>
        {part2}"
      </Text>
    );
  }

  return (
    <Text onPress={handleAddressPress} selectable>
      {value}
    </Text>
  );
};

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
        isCustomNode={(value: Renderable) =>
          typeof value === 'string' && AddressUtils.isValidAddress(value)
        }
        valueRenderer={(value: Renderable) => <CustomNode value={value} />}
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
