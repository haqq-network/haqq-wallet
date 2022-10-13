import React, {useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Image,
  View,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Button, ButtonVariant, Text} from '../components/ui';
import {BG_1, GRAPHIC_SECOND_5, TEXT_BASE_1} from '../variables';
import {useApp} from '../contexts/app';

const warningImage = require('../../assets/images/mnemonic-notify.png');

type ParamList = {
  backupNotification: {
    address: string;
  };
};

export const BackupNotificationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'backupNotification'>>();

  const app = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 1,
      duration: 250,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 0,
      duration: 250,
    }).start(() => {
      navigation.goBack();
    });
  }, [fadeAnim, navigation]);

  const onClickBackup = useCallback(() => {
    if (route.params.address) {
      navigation.goBack();
      navigation.navigate('backup', {
        address: route.params.address,
      });
    }
  }, [navigation, route]);

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

  return (
    <View style={page.container}>
      <Animated.View
        style={[
          page.animateView,
          {
            opacity: Animated.multiply(fadeAnim, 0.5),
          },
        ]}
      />
      <Animated.View
        style={[
          page.animateViewFade,
          {
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Dimensions.get('window').height, 0],
                }),
              },
            ],
          },
        ]}>
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
    backgroundColor: BG_1,
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
    backgroundColor: GRAPHIC_SECOND_5,
  },
  animateViewFade: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  t8: {
    marginBottom: 8,
    color: TEXT_BASE_1,
    fontWeight: '700',
    textAlign: 'center',
  },
  t14: {
    marginBottom: 28,
    textAlign: 'center',
  },
  margin: {marginBottom: 8},
});
