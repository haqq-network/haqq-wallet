import React, {useCallback, useEffect, useState} from 'react';

import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useWallets} from '@app/hooks';

export const WalletsWrapper = () => {
  const navigation = useTypedNavigation();
  const wallets = useWallets();
  const [visibleRows, setVisibleRows] = useState(wallets.visible);
  const [balance, setBalance] = useState(
    Object.fromEntries(
      visibleRows.map(w => [w.address, app.getBalance(w.address)]),
    ),
  );

  useEffect(() => {
    const onBalance = () => {
      setBalance(
        Object.fromEntries(
          visibleRows.map(w => [w.address, app.getBalance(w.address)]),
        ),
      );
    };

    app.on('balance', onBalance);
    return () => {
      app.off('balance', onBalance);
    };
  }, [visibleRows]);

  const updateWallets = useCallback(() => {
    setVisibleRows(wallets.visible);
  }, [wallets]);

  useEffect(() => {
    wallets.on('wallets', updateWallets);

    return () => {
      wallets.off('wallets', updateWallets);
    };
  }, [updateWallets, wallets]);

  const onPressSend = useCallback(
    (address: string) => {
      navigation.navigate('transaction', {from: address});
    },
    [navigation],
  );

  const onPressQR = useCallback((address: string) => {
    showModal('card-details-qr', {address: address});
  }, []);

  const onPressBackup = useCallback(
    (address: string) => {
      navigation.navigate('backup', {address: address});
    },
    [navigation],
  );

  const onPressCreate = useCallback(() => {
    navigation.navigate('create');
  }, [navigation]);

  const onPressLedger = useCallback(() => {
    navigation.navigate('ledger');
  }, [navigation]);

  const onPressRestore = useCallback(() => {
    navigation.navigate('restore');
  }, [navigation]);

  return (
    <Wallets
      balance={balance}
      wallets={visibleRows}
      onPressSend={onPressSend}
      onPressLedger={onPressLedger}
      onPressCreate={onPressCreate}
      onPressRestore={onPressRestore}
      onPressQR={onPressQR}
      onPressBackup={onPressBackup}
    />
  );
};
