import React from 'react';
import {View} from 'react-native';
import {Button, ButtonVariant, H3, Paragraph} from '../components/ui';
import {CompositeScreenProps} from '@react-navigation/native';

type BackupScreenProp = CompositeScreenProps<any, any>;

export const BackupScreen = ({navigation}: BackupScreenProp) => {
  const fadeOut = () => {
    navigation.goBack();
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
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
          If your recovery phrase is misplaced or stolen, it's the equivalent of
          losing your wallet. It's the only way to access your wallet if you
          forget your account password.
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
    </View>
  );
};
