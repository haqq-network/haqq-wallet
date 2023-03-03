import React, {useCallback, useEffect, useRef} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {WalletSelector} from '@app/components/wallet-selector';
import {app} from '@app/contexts';
import {createTheme, popupScreenOptions} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

const WalletSelectorStack = createStackNavigator();

const screenOptions = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerRight: DismissPopupButton,
};

export const WalletSelectorScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'walletSelector'>();
  const {title, wallets, initialAddress, eventSuffix = ''} = params;
  const selectedAddress = useRef(initialAddress);

  useEffect(() => {
    const onBlur = () => {
      app.emit(`wallet-selected${eventSuffix}`, selectedAddress.current);
    };

    navigation.addListener('blur', onBlur);
    return () => navigation.removeListener('blur', onBlur);
  }, [eventSuffix, navigation]);

  const onWalletSelected = useCallback((address: string) => {
    selectedAddress.current = address;
  }, []);

  const Component = useCallback(
    () => (
      <WalletSelector
        wallets={wallets}
        initialAddress={initialAddress}
        onWalletSelected={onWalletSelected}
        style={styles.walletSelector}
      />
    ),
    [initialAddress, onWalletSelected, wallets],
  );

  return (
    <WalletSelectorStack.Navigator screenOptions={{...screenOptions, title}}>
      <WalletSelectorStack.Screen name={title} component={Component} />
    </WalletSelectorStack.Navigator>
  );
};

const styles = createTheme({
  walletSelector: {
    marginHorizontal: 20,
  },
});
