import React, {useEffect} from 'react';

import {StyleSheet, View, useWindowDimensions} from 'react-native';
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

import {Button, ButtonVariant, Text} from './ui';

import {
  BG_1,
  GRAPHIC_SECOND_12,
  GRAPHIC_SECOND_5,
  TEXT_BLUE_1,
  TEXT_SECOND_4,
} from '../variables';

const timingOutAnimationConfig: WithTimingConfig = {
  duration: 550,
  easing: Easing.in(Easing.back()),
};

const timingInAnimationConfig: WithTimingConfig = {
  duration: 550,
  easing: Easing.out(Easing.back()),
};

interface ActionsSheetProps {
  onPressDiscard?: () => void;
  onPressKeepEditing?: () => void;
}

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
    fadeAnim.value = withTiming(fullyOpen, timingInAnimationConfig);
  }, [fadeAnim]);

  const handleDiscard = () => fadeOut(onPressDiscard);

  const handleKeepEditing = () => fadeOut(onPressKeepEditing);

  const bgAnimation = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [fullyOpen, fullyClosed], [0.5, 0]),
  }));

  const slideFromBottomAnimation = useAnimatedStyle(() => ({
    transform: [{translateY: fadeAnim.value}],
  }));

  return (
    <View style={page.container}>
      <Animated.View style={[page.animateView, bgAnimation]} />
      <Animated.View
        style={[
          page.animateViewFade,
          slideFromBottomAnimation,
          {paddingBottom: bottom},
        ]}>
        <View style={page.top}>
          <Text t14 style={page.t8}>
            Are you sure you want to discard your changes?
          </Text>
          <View style={page.line} />
          <Button
            title="Discard Changes"
            variant={ButtonVariant.error}
            onPress={handleDiscard}
            style={page.margin}
          />
        </View>
        <View style={page.bottom}>
          <Button
            title="Keep Editing"
            textColor={TEXT_BLUE_1}
            style={page.margin}
            variant={ButtonVariant.text}
            onPress={handleKeepEditing}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 30,
  },
  top: {
    borderRadius: 13,
    backgroundColor: GRAPHIC_SECOND_12,
  },
  bottom: {
    borderRadius: 13,
    backgroundColor: BG_1,
    marginVertical: 8,
  },
  animateView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GRAPHIC_SECOND_5,
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
    color: TEXT_SECOND_4,
  },
  line: {
    width: '100%',
    height: 0.3,
    backgroundColor: TEXT_SECOND_4,
  },
  margin: {paddingVertical: 18},
});
