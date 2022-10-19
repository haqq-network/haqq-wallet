import React, {useState} from 'react';
// import {BleManager} from 'react-native-ble-plx';
import {Button, Container, Spacer, Text} from '../components/ui';
// import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {EthNetwork} from '../services/eth-network';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {useWallet} from '../contexts/wallets';
import AppEth, {ledgerService} from '@ledgerhq/hw-app-eth';
import {getDefaultNetwork} from '../network';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// const bleManager = new BleManager();
const path = "44'/60'/0'/0/0";
export const SettingsTestScreen = () => {
  const [resp, setResp] = useState('');
  const wallet = useWallet('0x866e2B80Cc5b887C571f98199C1beCa15FF82084');

  const to = '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B';
  const from = '0x866e2B80Cc5b887C571f98199C1beCa15FF82084';
  const amount = '0.01';

  const onPress = async () => {
    try {
      const {transaction, unsignedTx} = await EthNetwork.populateTransaction(
        from,
        to,
        amount,
      );
      console.log('transaction', transaction);
      console.log('unsignedTx', unsignedTx);
      const transport = await TransportBLE.open(wallet?.deviceId);
      const eth = new AppEth(transport);
      const resolution = await ledgerService.resolveTransaction(unsignedTx);
      console.log('resolution', resolution);

      const signature = await eth.signTransaction(path, unsignedTx, resolution);
      console.log('signature', signature);
      let signedTx = EthNetwork.serializeTransaction(
        from,
        transaction,
        signature,
      );
      console.log('signedTx', signedTx);
      const response = await getDefaultNetwork().sendTransaction(signedTx);
      setResp(JSON.stringify(response));
      console.log(response);
    } catch (e) {
      console.log(e);
      console.log(e.message);
      console.log(e.stack);
    }
  };

  return (
    <Container>
      <Text>{resp}</Text>
      <Spacer />
      <Button title="Send" onPress={onPress} />
    </Container>
  );
};
