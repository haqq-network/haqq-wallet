import React, {useCallback, useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';

type Create1ScreenProp = CompositeScreenProps<any, any>;

export const Create1Screen = ({navigation}: Create1ScreenProp) => {
  const [password, setPassword] = useState<string>('');
  const wallet = useWallets();

  const onNext = useCallback(() => {
    wallet.setPassword(password).then(() => {
      navigation.navigate('create-2');
    });
  }, [password, wallet, navigation]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Create 1 Screen</Text>
      <TextInput
        placeholder={'Password'}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button disabled={!password.length} title="Go next" onPress={onNext} />
    </View>
  );
};
