import React, {memo, useCallback, useEffect} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {LedgerVerify} from '@app/components/ledger-verify';
import {app} from '@app/contexts';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';
import {LEDGER_APP} from '@app/variables/common';

export const LedgerVerifyScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const route = useTypedRoute<
    LedgerStackParamList,
    LedgerStackRoutes.LedgerVerify
  >();

  const onDone = useCallback(() => {
    return navigation.navigate(
      route.params.nextScreen || LedgerStackRoutes.LedgerStoreWallet,
      {
        type: 'ledger',
        address: route.params.address,
        hdPath: route.params.hdPath,
        publicKey: route.params.publicKey,
        deviceId: route.params.deviceId,
        deviceName: route.params.deviceName,
      },
    );
  }, [navigation, route.params]);

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

        if (address && address.toLowerCase() === route.params.address) {
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
    route.params.address,
    navigation,
  ]);

  return <LedgerVerify address={route.params.address} />;
});
