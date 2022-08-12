import {Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {app} from '../contexts/app';
import {wallets} from '../contexts/wallets';
import {transactions} from '../contexts/transactions';

type SplashScreenProp = CompositeScreenProps<any, any>;

export const SplashScreen = ({navigation}: SplashScreenProp) => {
  useEffect(() => {
    app.init().then(next => {
      switch (next) {
        case 'login':
        case 'pin':
          navigation.replace(next);
          break;
        case 'home': {
          wallets.init().then(() => {
            if (wallets.getWallets().length === 0) {
              navigation.replace('create-wallet');
            } else {
              transactions.init().then(() => {
                navigation.replace('home');
              });
            }
          });
        }
      }
    });
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04D484',
      }}>
      <Text>Splash Screen</Text>
    </View>
  );
};
