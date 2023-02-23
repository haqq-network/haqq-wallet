import React, {useCallback, useEffect, useState} from 'react';

import {Image, StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Icon, IconButton, Text} from '@app/components/ui';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletConnectApplication} from '@app/types';
import {getConnectedAppsByAddress} from '@app/utils';

export const WalletConnectApplicationList = () => {
  const navivation = useTypedNavigation();
  const {params} = useTypedRoute<'walletConnectApplicationList'>();
  const {activeSessions} = useWalletConnectSessions();
  const [apps, setApps] = useState<WalletConnectApplication[]>([]);

  useEffect(() => {
    navivation.setOptions({
      headerTitle: Wallet.getById(params.address)?.name || params.address,
    });
  }, [params.address, navivation]);

  useEffect(() => {
    const appsList = getConnectedAppsByAddress(activeSessions, params.address);
    setApps(appsList);
  }, [activeSessions, params.address, setApps]);

  const handleDisconnectPress = useCallback((app: WalletConnectApplication) => {
    WalletConnect.instance.disconnectSession(app.topic);
  }, []);

  return (
    <View style={styles.container}>
      {apps.map?.(app => (
        <View key={app.topic} style={styles.appContainer}>
          <Image style={styles.appIcon} source={{uri: app?.icons?.[0]}} />
          <Text t7>{app.name}</Text>

          <IconButton onPress={handleDisconnectPress.bind(null, app)}>
            <Icon color={getColor(Color.graphicRed1)} name="close" />
          </IconButton>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {width: '90%', alignSelf: 'center'},
  appIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
    marginRight: 5,
    backgroundColor: getColor(Color.graphicGreen1),
  },
  appContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});
