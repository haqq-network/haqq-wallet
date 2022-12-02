import React, {useEffect} from 'react';

import {Keyboard, StyleSheet, View, useWindowDimensions} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  WithTimingConfig,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {LIGHT_TEXT_BLUE_1} from '@app/variables';

import {createTheme} from './../../helpers/create-theme';

import {ActionsSheetProps} from '.';

const timingOutAnimationConfig: WithTimingConfig = {
  duration: 550,
  easing: Easing.in(Easing.back()),
};

const timingInAnimationConfig: WithTimingConfig = {
  duration: 550,
  easing: Easing.out(Easing.back()),
};

export const ActionsSheet = ({
  onPressDiscard,
  onPressKeepEditing,
}: ActionsSheetProps) => {
  const {height: H} = useWindowDimensions();
  const {bottom} = useSafeAreaInsets();

  const fullyOpen = 0;
  const fullyClosed = H * 0.45;

  const fadeAnim = useSharedValue(fullyClosed);

  const fadeOut = (endCallback?: () => void) => {
    const onEnd = () => endCallback?.();
    fadeAnim.value = withTiming(fullyClosed, timingOutAnimationConfig, () =>
      runOnJS(onEnd)(),
    );
  };

  useEffect(() => {
    Keyboard.dismiss();
    fadeAnim.value = withTiming(fullyOpen, timingInAnimationConfig);
  }, [fadeAnim]);

  const bgAnimation = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [fullyOpen, fullyClosed], [0.5, 0]),
  }));

  const slideFromBottomAnimation = useAnimatedStyle(() => ({
    transform: [{translateY: fadeAnim.value}],
  }));

  const handleDiscard = () => fadeOut(onPressDiscard);

  const handleKeepEditing = () => fadeOut(onPressKeepEditing);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.animateView, bgAnimation]} />
      <Animated.View
        style={[
          styles.animateViewFade,
          slideFromBottomAnimation,
          {paddingBottom: bottom},
        ]}>
        <View style={styles.top}>
          <Text t14 style={styles.t8}>
            {getText(I18N.actionSheetMessage)}
          </Text>
          <View style={styles.line} />
          <TouchableOpacity style={styles.margin} onPress={handleDiscard}>
            <Text color={Color.graphicRed1} t14 style={styles.tButton}>
              {getText(I18N.actionSheetDiscard)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.margin} onPress={handleKeepEditing}>
            <Text color={LIGHT_TEXT_BLUE_1} t14 style={styles.tButton}>
              {getText(I18N.actionSheetKeepEditing)}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = createTheme({
  top: {
    borderRadius: 13,
    backgroundColor: Color.graphicSecond1,
  },
  bottom: {
    borderRadius: 13,
    backgroundColor: Color.bg1,
    marginVertical: 8,
  },
  animateView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Color.bg9,
  },
  animateViewFade: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  t8: {
    marginHorizontal: 16,
    marginVertical: 12,
    textAlign: 'center',
    color: Color.graphicBase2,
  },
  tButton: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontSize: 20,
    lineHeight: 25,
  },
  line: {
    width: '100%',
    height: 0.3,
    backgroundColor: Color.textSecond1,
  },
  margin: {
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
});
