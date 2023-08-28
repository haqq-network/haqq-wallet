import React, {useCallback, useEffect} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {LedgerVerify} from '@app/components/ledger-verify';
import {app} from '@app/contexts';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {LEDGER_APP} from '@app/variables/common';

export const LedgerVerifyScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'ledgerVerify'>();

  const onDone = useCallback(() => {
    // @ts-ignore
    return navigation.navigate(route.params.nextScreen ?? 'ledgerStore', {
      type: 'ledger',
      address: route.params?.address,
      hdPath: route.params.hdPath,
      publicKey: route.params.publicKey,
      deviceId: route.params.deviceId,
      deviceName: route.params.deviceName,
    });
  }, [
    navigation,
    route.params.nextScreen,
    route.params?.address,
    route.params.hdPath,
    route.params.publicKey,
    route.params.deviceId,
    route.params.deviceName,
  ]);

  useEffect(() => {
    const provider = new ProviderLedgerReactNative({
      getPassword: app.getPassword.bind(app),
      deviceId: route.params.deviceId,
      appName: LEDGER_APP,
    });

    requestAnimationFrame(async () => {
      try {
        await awaitForBluetooth();

        const address = await provider.confirmAddress(route.params.hdPath);

        if (address && address.toLowerCase() === route.params?.address) {
          onDone();
        }
      } catch (e) {
        navigation.goBack();
      }
    });

    return () => {
      provider.abort();
    };
  }, [
    route.params.deviceId,
    route.params.hdPath,
    onDone,
    route.params?.address,
    navigation,
  ]);

  return <LedgerVerify address={route.params?.address} />;
};
