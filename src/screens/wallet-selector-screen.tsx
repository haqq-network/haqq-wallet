import React, {memo, useCallback, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {WalletSelector} from '@app/components/wallet-selector';
import {app} from '@app/contexts';
import {createTheme, popupScreenOptions} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

const Stack = createNativeStackNavigator();

const screenOptions = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerRight: DismissPopupButton,
};

export const WalletSelectorScreen = memo(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const {params} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.WalletSelector
  >();
  const {title, wallets, initialAddress, errorEventName, successEventName} =
    params;
  const selectedAddress = useRef(initialAddress);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (selectedAddress.current) {
          app.emit(successEventName, selectedAddress.current);
        } else {
          app.emit(errorEventName);
        }
      };
    }, [navigation, errorEventName, successEventName]),
  );

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
    <Stack.Navigator screenOptions={{...screenOptions, title}}>
      <Stack.Screen name={title} component={Component} />
    </Stack.Navigator>
  );
});

const styles = createTheme({
  walletSelector: {
    marginHorizontal: 20,
  },
});
