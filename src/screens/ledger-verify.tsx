import React, {useCallback, useEffect} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {LedgerVerify} from '@app/components/ledger-verify';
import {captureException} from '@app/helpers';
import {mockForWallet} from '@app/helpers/mockForWallet';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const LedgerVerifyScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'ledgerVerify'>();

  const onDone = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'ledgerStore', {
      address: route.params.address,
      hdPath: route.params.hdPath,
      publicKey: route.params.publicKey,
      deviceId: route.params.deviceId,
      deviceName: route.params.deviceName,
    });
  }, [
    navigation,
    route.params.nextScreen,
    route.params.address,
    route.params.hdPath,
    route.params.publicKey,
    route.params.deviceId,
    route.params.deviceName,
  ]);

  useEffect(() => {
    const provider = new ProviderLedgerReactNative(mockForWallet, {
      cosmosPrefix: 'haqq',
      deviceId: route.params.deviceId,
      hdPath: '',
    });

    requestAnimationFrame(async () => {
      try {
        const address = await provider.confirmAddress(route.params.hdPath);

        if (address && address.toLowerCase() === route.params.address) {
          onDone();
        }
      } catch (e) {
        captureException(e, 'LedgerVerify');
      }
    });

    return () => {
      provider.abort();
    };
  }, [
    route.params.deviceId,
    route.params.hdPath,
    onDone,
    route.params.address,
  ]);

  return <LedgerVerify address={route.params.address} />;
};
