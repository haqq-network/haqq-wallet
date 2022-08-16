import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions, View} from 'react-native';
import {Button, ButtonVariant, H3, Paragraph} from '../components/ui';

type BackupScreenProp = {
  onClose: () => void;
};

export const BackupScreen = ({onClose}: BackupScreenProp) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 1,
      duration: 250,
    }).start();
  }, []);

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 0,
      duration: 250,
    }).start(() => {
      onClose();
    });
  };

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
            onPress={fadeOut}
            style={{marginBottom: 8}}
          />
          <Button
            title="I will risk it"
            variant={ButtonVariant.error}
            onPress={fadeOut}
          />
        </View>
      </Animated.View>
    </View>
  );
};
