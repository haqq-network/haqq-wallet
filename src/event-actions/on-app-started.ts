import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {AppState, Linking} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers';
import {Wallet} from '@app/models/wallet';

export async function onAppStarted() {
  const linkingSubscription = ({url}: {url: string}) => {
    app.emit(Events.onDeepLink, url);
  };

  Linking.addListener('url', linkingSubscription);

  const subscription = ({isConnected}: NetInfoState) => {
    isConnected ? hideModal('no-internet') : showModal('no-internet');
  };

  NetInfo.fetch().then(subscription);

  NetInfo.addEventListener(subscription);
  AppState.addEventListener('change', () => {
    if (AppState.currentState === 'active') {
      NetInfo.fetch().then(subscription);
    }
  });

  const initialUrl = await Linking.getInitialURL();
  app.emit(Events.onDeepLink, initialUrl);

  const wallets = Wallet.getAllVisible();

  await Promise.all(
    wallets.map(wallet => {
      return new Promise(resolve => {
        app.emit(Events.onTransactionsLoad, wallet.address, resolve);
      });
    }),
  );
}
