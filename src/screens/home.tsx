import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, Text, View} from 'react-native';
import {useWallet} from '../contexts/wallet';

type HomeScreenProp = CompositeScreenProps<any, any>;

export const HomeScreen = ({navigation}: HomeScreenProp) => {
  const wallet = useWallet();

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('details')}
      />
      <Button
        title="Logout"
        onPress={() => {
          wallet.clean().then(() => {
            navigation.navigate('login');
          });
        }}
      />
    </View>
  );
};
