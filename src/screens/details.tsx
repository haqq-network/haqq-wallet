import React, {useCallback} from 'react';
import {Alert, Button, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';

type DetailsScreenProp = CompositeScreenProps<any, any>;

export const DetailsScreen = ({navigation, route}: DetailsScreenProp) => {
  const {address} = route.params;
  const wallets = useWallets();

  const onRemove = useCallback(() => {
    return Alert.alert(
      'Are your sure?',
      'Are you sure you want to remove this wallet?',
      [
        {
          text: 'Yes',
          onPress: () => {
            wallets.removeWallet(address).then(() => {
              navigation.goBack();
            });
          },
        },
        {
          text: 'No',
        },
      ],
    );
  }, [wallets, address, navigation]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Details Screen</Text>
      <Text>{address}</Text>
      <Button
        title="Send transaction"
        onPress={() => navigation.navigate('send-transaction', {from: address})}
      />
      <View style={{flex: 1}} />
      <Button title="Remove account" onPress={onRemove} />
    </View>
  );
};
