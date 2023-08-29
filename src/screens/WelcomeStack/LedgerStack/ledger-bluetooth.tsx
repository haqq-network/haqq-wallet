import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {State} from '@haqq/provider-ledger-react-native';
import {Subscription} from 'rxjs';

import {LedgerBluetooth} from '@app/components/ledger-bluetooth';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {requestLocationPermission} from '@app/helpers/request-location-permission';
import {useTypedNavigation} from '@app/hooks';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';
import {SystemDialog} from '@app/services/system-dialog';

export const LedgerBluetoothScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();

  const subscription = useRef<null | Subscription>(null);
  const [loading, setLoading] = useState(false);
  const [btState, setBtState] = useState(State.Unknown);

  useEffect(() => {
    return () => {
      if (subscription.current) {
        subscription.current?.unsubscribe();
      }
    };
  }, []);

  const onDone = useCallback(async () => {
    const {granted} = await requestLocationPermission();

    if (granted) {
      navigation.navigate(LedgerStackRoutes.LedgerScan);
    } else {
      showModal('locationUnauthorized');
    }

    requestAnimationFrame(() => {
      app.bluetooth = true;
    });
  }, [navigation]);

  const onPressAllow = useCallback(async () => {
    if (subscription.current) {
      subscription.current?.unsubscribe();
    }
    setLoading(true);
    const sub = await SystemDialog.tryToInitBt();
    // @ts-ignore
    subscription.current = sub.subscribe({
      next: (state: State) => {
        switch (state) {
          case State.PoweredOn:
            setLoading(false);
            onDone();
            break;
          case State.PoweredOff:
          case State.Unauthorized:
            setLoading(false);
            setBtState(state);
            break;
          default:
            setBtState(state);
        }
      },
    });
  }, [onDone]);

  return (
    <LedgerBluetooth
      onPressAllow={onPressAllow}
      btState={btState}
      loading={loading}
    />
  );
});
