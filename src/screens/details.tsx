import React, {useCallback} from 'react';
import {Alert, Button, StyleSheet, TouchableOpacity, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useWallets} from '../contexts/wallets';
import {Container, Paragraph} from '../components/ui';

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
      <Paragraph clean>Details Screen</Paragraph>
      <TouchableOpacity onPress={() => Clipboard.setString(address)}>
        <Paragraph clean>{address}</Paragraph>
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
