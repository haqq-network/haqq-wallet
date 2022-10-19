import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {Device} from 'react-native-ble-plx';
import {RootStackParamList} from '../types';
import {PopupContainer} from '../components/ui';
import {OnScanEvent, useLedger} from '../contexts/ledger';
import {LedgerScanRow} from '../components/rows';

export const LedgerScanScreen = () => {
  const ledger = useLedger();
  const [devices, setDevices] = useState<Device[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const subscription = (event: OnScanEvent) => {
      if (event.refreshing) {
        setRefreshing(event.refreshing);
      }

      if (event.device) {
        setDevices(devicesList =>
          devicesList.some(device => device.id === event.device.id)
            ? devicesList
            : devicesList.concat(event.device),
        );
      }

      if (event.error) {
        setError(event.error);
      }
    };

    ledger.on('onScan', subscription);
    ledger.scan();
    return () => {
      ledger.off('onScan', subscription);
    };
  }, [ledger]);

  const onPress = useCallback(
    (item: Device) => {
      ledger.device = item;
      navigation.navigate('ledgerDevice', {});
    },
    [ledger, navigation],
  );

  return (
    <PopupContainer>
      <FlatList
        data={devices}
        renderItem={({item}) => <LedgerScanRow item={item} onPress={onPress} />}
        refreshing={refreshing}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({});
