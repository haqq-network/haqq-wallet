import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {useLedger} from '../contexts/ledger';

export const LedgerDeviceScreen = () => {
  const ledger = useLedger();
  const [address, setAddress] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const subscription = a => {
      setAddress(a);
    };
    ledger.on('onAddress', subscription);

    const stop = ledger.getAddress();

    return () => {
      ledger.off('onAddress', subscription);
      stop();
    };
  });

  const onPressAdd = () => {
    if (address) {
      navigation.navigate('ledgerVerify', {address});
    }
  };

  return (
    <PopupContainer>
      <Text>{address}</Text>
      <Spacer />
      <Button
        disabled={!address}
        style={page.submit}
        variant={ButtonVariant.contained}
        title="Add"
        onPress={onPressAdd}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  submit: {},
});
