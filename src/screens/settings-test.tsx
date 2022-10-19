import React, {useCallback, useEffect, useRef, useState} from 'react';
// import {BleManager} from 'react-native-ble-plx';
import {Button, Container} from '../components/ui';
// import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {FlatList, PermissionsAndroid, Platform} from 'react-native';
import {Observable} from 'rxjs';
import AppEth from '@ledgerhq/hw-app-eth';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// const bleManager = new BleManager();
const path = "44'/60'/0'/0/0";
export const SettingsTestScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDeices] = useState([]);
  const [transport, setTransport] = useState(null);
  const [address, setAddress] = useState('');
  const sub = useRef();
  // const startScan = useCallback(async () => {
  //   setRefreshing(true);
  //   sub.current = new Observable(TransportBLE.listen).subscribe({
  //     complete: () => {
  //       setRefreshing(false);
  //     },
  //     next: e => {
  //       if (e.type === 'add') {
  //         const d = e.descriptor;
  //         setDeices(devicesList =>
  //           devicesList.some(dev => dev.id === d.id)
  //             ? devicesList
  //             : devicesList.concat(d),
  //         );
  //       }
  //     },
  //     error: error => {
  //       console.log('error', error);
  //     },
  //   });
  // }, []);
  //
  // const reload = useCallback(
  //   props => {
  //     if (sub.current) {
  //       sub.current.unsubscribe();
  //       setDeices([]);
  //       setRefreshing(false);
  //     }
  //     startScan();
  //   },
  //   [startScan],
  // );
  //
  // useEffect(() => {
  //   Promise.resolve()
  //     .then(async () => {
  //       if (Platform.OS === 'android') {
  //         await PermissionsAndroid.request(
  //           PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  //         );
  //       }
  //     })
  //     .then(() => {
  //       let previousAvailable = false;
  //       new Observable(TransportBLE.observeState).subscribe(e => {
  //         if (e.available !== previousAvailable) {
  //           previousAvailable = e.available;
  //           if (e.available) {
  //             reload();
  //           }
  //         }
  //       });
  //     })
  //     .then(() => startScan());
  // }, [reload, startScan]);
  //
  // const onPress = useCallback(async device => {
  //   console.log('onPress', device);
  //   const transport = await TransportBLE.open(device);
  //   transport.on('disconnect', () => {
  //     // Intentionally for the sake of simplicity we use a transport local state
  //     // and remove it on disconnect.
  //     // A better way is to pass in the device.id and handle the connection internally.
  //     setTransport(null);
  //   });
  //   console.log('transport', transport);
  //   setTransport(transport);
  // }, []);
  //
  // useEffect(() => {
  //   if (transport) {
  //     Promise.resolve(new AppEth(transport))
  //       .then(eth => eth.getAddress(path, false))
  //       .then(({address}) => {
  //         console.log('address', address);
  //         setAddress(address);
  //       });
  //   }
  // }, [transport]);

  return (
    <Container>
      <FlatList
        refreshing={refreshing}
        data={devices}
        renderItem={({item}) => (
          <Button title={item.name} onPress={() => onPress(item)} />
        )}
      />
    </Container>
  );
};
