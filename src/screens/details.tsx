import React, {useCallback} from 'react';
import {Alert, Button, StyleSheet, TouchableOpacity, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {Container, Text} from '../components/ui';

type ParamList = {
  details: {
    address: string;
  };
};

export const DetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'details'>>();
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
      <Text clean>Details Screen</Text>
      <TouchableOpacity onPress={() => Clipboard.setString(address)}>
        <Text clean>{address}</Text>
      </TouchableOpacity>
      <Button
        title="Send transaction"
        onPress={() => navigation.navigate('transaction', {from: address})}
      />
      <Button
        title="Show qr"
        onPress={() => navigation.navigate('detailsQr', {address: address})}
      />
      <View style={page.flex} />
      <Button title="Remove account" onPress={onRemove} />
    </Container>
  );
};

const page = StyleSheet.create({
  flex: {flex: 1},
});
