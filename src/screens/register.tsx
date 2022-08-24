import React, {useCallback, useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useApp} from '../contexts/app';

type Create1ScreenProp = CompositeScreenProps<any, any>;

export const RegisterScreen = ({navigation}: Create1ScreenProp) => {
  const [password, setPassword] = useState<string>('');
  const app = useApp();

  const onNext = useCallback(async () => {
    await app.setPin(password);
    const user = await app.loadUser();
    if (!user) {
      await app.createUser();
    }
    navigation.navigate('create-wallet');
  }, [password, app, navigation]);

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
