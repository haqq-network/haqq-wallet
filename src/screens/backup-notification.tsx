import React, {useCallback, useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  WithTimingConfig,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Button, ButtonVariant, Text} from '../components/ui';
import {useApp} from '../contexts/app';
import {RootStackParamList} from '../types';
import {LIGHT_BG_1, LIGHT_BG_9, LIGHT_TEXT_BASE_1} from '../variables';

const warningImage = require('../../assets/images/mnemonic-notify.png');

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
    return Alert.alert(
      'Proceed withut backup?',
      'If you lose access to your wallet, we will not be able to restore your wallet if you do not make a backup',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          style: 'destructive',
          onPress: () => {
            app.setSnoozeBackup();
            fadeOut();
          },
        },
      ],
    );
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
        <View style={page.sub}>
          <Image
            source={warningImage}
            style={{width: Dimensions.get('window').width - 80}}
          />
          <Text t8 style={page.t8}>
            Backup your wallet, keep your assets safe
          </Text>
          <Text t14 style={page.t14}>
            If your recovery phrase is misplaced or stolen, it's the equivalent
            of losing your wallet. It's the only way to access your wallet if
            you forget your account password.
          </Text>
          <Button
            title="Backup now"
            variant={ButtonVariant.contained}
            onPress={onClickBackup}
            style={page.margin}
          />
          <Button
            title="I will risk it"
            variant={ButtonVariant.error}
            onPress={onClickSkip}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {flex: 1},
  sub: {
    marginHorizontal: 16,
    marginVertical: 42,
    backgroundColor: LIGHT_BG_1,
    flex: 0,
    padding: 24,
    borderRadius: 16,
    paddingBottom: 16,
  },
  animateView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: LIGHT_BG_9,
  },
  animateViewFade: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  t8: {
    marginBottom: 8,
    color: LIGHT_TEXT_BASE_1,
    fontWeight: '700',
    textAlign: 'center',
  },
  t14: {
    marginBottom: 28,
    textAlign: 'center',
  },
  margin: {marginBottom: 8},
});
