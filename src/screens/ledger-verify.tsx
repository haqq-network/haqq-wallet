import React, {useCallback, useEffect} from 'react';

import {LedgerVerify} from '@app/components/ledger-verify';
import {captureException, runUntil} from '@app/helpers';
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
    const iter = runUntil(route.params.deviceId, eth =>
      eth.getAddress(route.params.hdPath, true),
    );
    requestAnimationFrame(async () => {
      try {
        let verifiedAddress = null;
        let done = false;
        do {
          const resp = await iter.next();
          done = resp.done;
          if (resp.value) {
            verifiedAddress = resp.value.address;
          }
        } while (!done);
        if (verifiedAddress && verifiedAddress === route.params.address) {
          onDone();
        }
      } catch (e) {
        captureException(e, 'LedgerVerify');
      }
    });

    return () => {
      iter.abort();
    };
  }, [
    route.params.deviceId,
    route.params.hdPath,
    onDone,
    route.params.address,
  ]);

  return <LedgerVerify address={route.params.address} />;
};
