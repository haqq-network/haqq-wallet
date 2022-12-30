import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton, Text} from '@app/components/ui';
import {moderateScale} from '@app/helpers/scaling-utils';
import {useThematicStyles} from '@app/hooks';
import {I18N} from '@app/i18n';

export type NumericKeyboardProps = {
  onPress: (value: number) => void;
  additionButton?: React.ReactNode;
};

export const NumericKeyboard = ({
  onPress,
  additionButton,
}: NumericKeyboardProps) => {
  const styles = useThematicStyles(stylesObj);

  return (
    <View style={styles.container}>
      <IconButton
        style={styles.button}
        onPress={() => onPress(1)}
        testID="numeric_keyboard_1">
        <Text u0 i18n={I18N.numericKeyboard1} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(2)}
        testID="numeric_keyboard_2">
        <Text u0 i18n={I18N.numericKeyboard2} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(3)}
        testID="numeric_keyboard_3">
        <Text u0 i18n={I18N.numericKeyboard3} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(4)}
        testID="numeric_keyboard_4">
        <Text u0 i18n={I18N.numericKeyboard4} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(5)}
        testID="numeric_keyboard_5">
        <Text u0 i18n={I18N.numericKeyboard5} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(6)}
        testID="numeric_keyboard_6">
        <Text u0 i18n={I18N.numericKeyboard6} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(7)}
        testID="numeric_keyboard_7">
        <Text u0 i18n={I18N.numericKeyboard7} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(8)}
        testID="numeric_keyboard_8">
        <Text u0 i18n={I18N.numericKeyboard8} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(9)}
        testID="numeric_keyboard_9">
        <Text u0 i18n={I18N.numericKeyboard9} color={Color.textBase1} />
      </IconButton>
      <View style={styles.button}>{additionButton}</View>
      <IconButton
        style={styles.button}
        onPress={() => onPress(0)}
        testID="numeric_keyboard_0">
        <Text u0 i18n={I18N.numericKeyboard0} color={Color.textBase1} />
      </IconButton>
      <IconButton
        style={styles.button}
        onPress={() => onPress(-1)}
        testID="numeric_keyboard_rem">
        <Icon i32 name="clear" color={Color.textBase1} />
      </IconButton>
    </View>
  );
};

const stylesObj = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    marginHorizontal: 12,
    marginVertical: 2,
    width: moderateScale(72, 0.6),
    height: moderateScale(72, 0.6),
    maxHeight: moderateScale(72, 1.2),
    maxWidth: moderateScale(72, 1.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
