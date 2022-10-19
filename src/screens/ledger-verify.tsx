import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {PopupContainer, Text} from '../components/ui';
import {useLedger} from '../contexts/ledger';
import {useWallets} from '../contexts/wallets';

export const LedgerVerifyScreen = () => {
  const ledger = useLedger();
  const wallets = useWallets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerVerify'>>();

  useEffect(() => {
    ledger.getAddressTransport(ledger.device!, true).then(address => {
      if (!address || !ledger.device?.id) {
        throw new Error('something wrong');
      }
      return wallets
        .addWalletFromLedger(
          {
            address: address,
            deviceId: ledger.device?.id,
          },
          `Ledger ${ledger.device.name}`,
        )
        .then(() => {
          navigation.navigate('ledgerFinish', {});
        });
    });
  }, [ledger, navigation, wallets]);

  return (
    <PopupContainer>
      <Text>verify</Text>
      <Text>{route.params.address}</Text>
    </PopupContainer>
  );
};

const page = StyleSheet.create({});
