import React, {useCallback, useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';

type Create1ScreenProp = CompositeScreenProps<any, any>;

export const Create1Screen = ({navigation}: Create1ScreenProp) => {
  const [password, setPassword] = useState<String>('');

  const onPasswordChange = useCallback((value: String) => {
    setPassword(value);
  }, []);

  console.log(password);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Create 1 Screen</Text>
      <TextInput
        placeholder={'Password'}
        onChangeText={onPasswordChange}
        secureTextEntry
      />
      <Button
        disabled={!password.length}
        title="Go next"
        onPress={() =>
          navigation.navigate('create-2', {
            password,
          })
        }
      />
    </View>
  );
};
