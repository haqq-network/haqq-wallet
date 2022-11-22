import React, {useCallback, useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View, useWindowDimensions} from 'react-native';
import Animated, {
  Easing,
  WithTimingConfig,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {BackupNotification} from '@app/components/backup-notification/backup-notification';
import {createTheme} from '@app/helpers';
import {useApp} from '@app/hooks';

import {RootStackParamList} from '../types';

const timingOutAnimationConfig: WithTimingConfig = {
  duration: 650,
  easing: Easing.in(Easing.back()),
};

const timingInAnimationConfig: WithTimingConfig = {
  duration: 650,
  easing: Easing.out(Easing.back()),
};

export const BackupNotificationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupNotification'>>();

  const {height: H} = useWindowDimensions();

  const fullyOpen = 0;
  const fullyClosed = H * 0.85;

  const fadeAnim = useSharedValue(fullyClosed);
  const app = useApp();

  const fadeOut = useCallback(
    (endCallback?: () => void) => {
      const onEnd = () => {
        navigation.goBack();
        endCallback?.();
      };
      fadeAnim.value = withTiming(fullyClosed, timingOutAnimationConfig, () =>
        runOnJS(onEnd)(),
      );
    },
    [navigation, fullyClosed, fadeAnim],
  );

  const onClickBackup = useCallback(() => {
    if (route.params.address) {
      fadeOut(() => {
        navigation.navigate('backup', {
          address: route.params.address,
        });
      });
    }
  }, [navigation, route, fadeOut]);

  useEffect(() => {
    fadeAnim.value = withTiming(fullyOpen, timingInAnimationConfig);
  }, [fadeAnim]);

  const onClickSkip = useCallback(() => {
    app.setSnoozeBackup();
    fadeOut();
  }, [app, fadeOut]);

  const bgAnimation = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [fullyOpen, fullyClosed], [1, 0]),
  }));

  const slideFromBottomAnimation = useAnimatedStyle(() => ({
    transform: [{translateY: fadeAnim.value}],
  }));

  return (
    <View style={page.container}>
      <Animated.View style={[page.animateView, bgAnimation]} />
      <Animated.View style={[page.animateViewFade, slideFromBottomAnimation]}>
        <BackupNotification
          onClickBackup={onClickBackup}
          onClickSkip={onClickSkip}
        />
      </Animated.View>
    </View>
  );
};

const page = createTheme({
  container: {flex: 1},
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
  },
});
