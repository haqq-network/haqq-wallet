import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {Alert, Animated, Dimensions, Image, View} from 'react-native';
import {Button, ButtonVariant, H3, Paragraph} from '../components/ui';
import {Wallet} from '../models/wallet';

type BackupScreenProp = {
  onClose: () => void;
  wallet: Wallet | null;
};
const warningImage = require('../../assets/images/mnemonic-notify.png');

export const BackupScreen = ({onClose, wallet}: BackupScreenProp) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
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
      onClose();
    });
  }, [fadeAnim, onClose]);

  const onClickBackup = useCallback(() => {
    if (wallet) {
      onClose();
      navigation.navigate('backup', {
        address: wallet.address,
      });
    }
  }, [navigation, wallet, fadeOut]);

  const onClickSkip = useCallback(() => {
    return Alert.alert(
      'Proceed withut backup?',
      'If you lose access to your wallet, we will not be able to restore your wallet if you do not make a backup',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Accept',
          onPress: fadeOut,
        },
      ],
    );
  }, [fadeOut]);

  if (!wallet) {
    return null;
  }

  return (
    <View style={{flex: 1}}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          opacity: Animated.multiply(fadeAnim, 0.5),
        }}
      />
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [Dimensions.get('window').height, 0],
              }),
            },
          ],
        }}>
        <View
          style={{
            marginHorizontal: 16,
            marginVertical: 42,
            backgroundColor: '#FFFFFF',
            flex: 0,
            padding: 24,
            borderRadius: 16,
          }}>
          <Image
            source={warningImage}
            style={{width: Dimensions.get('window').width - 80}}
          />
          <H3 style={{marginBottom: 8}}>
            Backup your wallet, keep your assets safe
          </H3>
          <Paragraph style={{marginBottom: 28, textAlign: 'center'}}>
            If your recovery phrase is misplaced or stolen, it's the equivalent
            of losing your wallet. It's the only way to access your wallet if
            you forget your account password.
          </Paragraph>
          <Button
            title="Backup now"
            variant={ButtonVariant.contained}
            onPress={onClickBackup}
            style={{marginBottom: 8}}
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
