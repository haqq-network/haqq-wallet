import React, {useCallback, useEffect, useRef, useState} from 'react';

import {State, tryToInitBt} from '@haqq/provider-ledger-react-native';
import {Subscription} from 'rxjs';

import {showModal} from '@app/helpers';
import {requestLocationPermission} from '@app/helpers/request-location-permission';
import {useTypedNavigation, useUser} from '@app/hooks';

import {LedgerBluetooth} from '../components/ledger-bluetooth';

export const LedgerBluetoothScreen = () => {
  const user = useUser();
  const navigation = useTypedNavigation();

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
    requestLocationPermission().then(({granted}) => {
      if (granted) {
        navigation.navigate('ledgerScan');
      } else {
        showModal('location-unauthorized');
      }
    });

    requestAnimationFrame(() => {
      user.bluetooth = true;
    });
  }, [navigation, user]);

  const onPressAllow = useCallback(async () => {
    if (subscription.current) {
      subscription.current?.unsubscribe();
    }
    setLoading(true);
    const sub = await tryToInitBt();
    console.log('sub');
    subscription.current = sub.subscribe({
      next: (state: State) => {
        console.log('state', state);
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
};
