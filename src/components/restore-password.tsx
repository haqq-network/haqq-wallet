import React, {useCallback, useEffect, useRef} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  BG_1,
  BG_9,
  GRAPHIC_BASE_4,
  TEXT_BASE_1,
  TEXT_BASE_2,
} from '../variables';
import {Button, ButtonVariant, CloseCircle, IconButton, Paragraph} from './ui';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';

const h = Dimensions.get('window').height;

type RestorePasswordProps = {
  onClose: () => void;
};

export const RestorePassword = ({onClose}: RestorePasswordProps) => {
  const wallet = useWallets();
  const app = useApp();
  const pan = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderEnd: () => true,
      onPanResponderMove: (event, gestureState) => {
        pan.setValue(gestureState.dy / h);
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > h / 3) {
          onClosePopup();
        } else {
          onOpenPopup();
        }
      },
    }),
  ).current;

  const onClosePopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  }, [pan, onClose]);

  const onOpenPopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [pan]);

  useEffect(() => {
    onOpenPopup();
  }, [onOpenPopup]);

  const onClickReset = useCallback(() => {
    return Alert.alert(
      'Attention. You may lose all your funds!',
      'Do not reset the application if you are not sure that you can restore your account. To restore, you will need a backup phrase of 12 words that you made for your account',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: 'Reset',
          onPress: async () => {
            await wallet.clean();
            await app.clean();
            Animated.timing(pan, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              app.emit('resetWallet');
            });
          },
        },
      ],
    );
  }, [app, pan, wallet]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: BG_9,
            opacity: pan.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          page.animateView,
          {
            transform: [{translateY: Animated.multiply(pan, h)}],
          },
        ]}
        {...panResponder.panHandlers}>
        <View style={page.flex}>
          <TouchableWithoutFeedback style={page.flex} onPress={onClosePopup}>
            <View style={page.flex} />
          </TouchableWithoutFeedback>
          <SafeAreaView style={page.box}>
            <View style={page.boxInner}>
              <View style={page.titleBlock}>
                <Paragraph clean style={page.title}>
                  Forgot the code?
                </Paragraph>
                <IconButton onPress={onClosePopup}>
                  <CloseCircle color={GRAPHIC_BASE_4} />
                </IconButton>
              </View>
              <Paragraph clean style={page.warning}>
                Unfortunately, the password cannot be reset. Try to wait a bit
                and remember the password. If it does not work, then click the
                ‘Reset wallet button and use the backup phrase to restore the
                wallet. If there is no backup phrase, then you will not be able
                to restore the wallet
              </Paragraph>
              <Button
                variant={ButtonVariant.error}
                title="Reset wallet"
                onPress={onClickReset}
              />
            </View>
          </SafeAreaView>
        </View>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  flex: {flex: 1},
  animateView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  box: {
    width: Dimensions.get('window').width,
    backgroundColor: BG_1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  boxInner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleBlock: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 30,
    color: TEXT_BASE_1,
  },
  warning: {
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_2,
  },
});
