import React, {useCallback, useEffect, useState} from 'react';
import TransportHID from '@ledgerhq/react-native-hid';
import AppEth from '@ledgerhq/hw-app-eth';
import {Text, View} from 'react-native';
import {Button, ButtonVariant} from '../components/ui';
import {useWallets} from '../contexts/wallets';

const path = "44'/60'/0'/0/0"; // HD derivation path

export const LedgerHid = () => {
  const wallets = useWallets();
  const [saving, setSaving] = useState(false);
  const [transport, setTransport] = useState<{
    publicKey: string;
    address: string;
    chainCode?: string;
  } | null>(null);

  useEffect(() => {
    TransportHID.create()
      .then(t => {
        const eth = new AppEth(t);
        return eth.getAddress(path, false);
      })
      .then(resp => {
        console.log('resp', resp);
        setTransport(resp);
      })
      .catch(e => {
        console.log('err', e.message);
      });
  }, []);

  const onPressAddWallet = useCallback(async () => {
    if (transport?.address) {
      const wallet = wallets.getWallet(transport.address);
      if (!wallet) {
        setSaving(true);
        const w = await wallets.addWalletFromLedger(transport.address);
        console.log('wallet', w);
        setSaving(false);
      }
    }
  }, [transport, wallets]);

  if (!transport) {
    return (
      <View>
        <Text>Scanning for Ledger...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>{transport.address}</Text>
      <Button
        disabled={saving || !transport.address}
        title="Add wallet"
        onPress={onPressAddWallet}
        variant={ButtonVariant.contained}
      />
    </View>
  );
};
