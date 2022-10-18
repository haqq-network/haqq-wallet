import React, {useCallback, useEffect} from 'react';
import {Container} from '../components/ui';
// import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export const SettingsTestScreen = () => {
  const startScan = useCallback(() => {
    // TransportBLE.listen((...props) => {
    //   console.log(...props);
    // });
  }, []);
  useEffect(() => {
    startScan();
  }, [startScan]);

  return <Container />;
};
