import {useEffect} from 'react';

import {useAppState} from '@react-native-community/hooks';
import {observer} from 'mobx-react';

import {AppStore} from '@app/models/app';
import {Socket} from '@app/models/socket';
import {RemoteConfig} from '@app/services/remote-config';

export const SocketHandler = observer(() => {
  const appState = useAppState();
  useEffect(() => {
    if (AppStore.isRpcOnly) {
      return;
    }
    if (appState === 'active') {
      Socket.attach(RemoteConfig.get('ws_updates'));
    } else if (appState === 'inactive') {
      return;
    } else {
      Socket.detach();
    }
  }, [appState]);
  return null;
});
