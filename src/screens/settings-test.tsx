import React, {useCallback, useEffect} from 'react';
import {Container} from '../components/ui';
import {Dimensions} from 'react-native';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

const width = Dimensions.get('window').width - 60;

export const SettingsTestScreen = () => {
  const startScan = useCallback(() => {
    TransportBLE.listen((...props) => {
      console.log(...props);
    });
  }, []);
  useEffect(() => {
    startScan();
  }, [startScan]);

  return <Container />;
};
