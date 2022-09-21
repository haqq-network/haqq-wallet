import React, {useCallback} from 'react';
import {Alert, Button, Text, TouchableOpacity, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/ui';

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
    <Container>
      <Text>Details Screen</Text>
      <TouchableOpacity onPress={() => Clipboard.setString(address)}>
        <Text>{address}</Text>
      </TouchableOpacity>
      <Button
        title="Send transaction"
        onPress={() => navigation.navigate('transaction', {from: address})}
      />
      <Button
        title="Show qr"
        onPress={() => navigation.navigate('detailsQr', {address: address})}
      />
      <View style={{flex: 1}} />
      <Button title="Remove account" onPress={onRemove} />
    </Container>
  );
};
