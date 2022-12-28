import React from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';

import {
  AppContext,
  ThemeProvider,
  TransactionsContext,
  WalletsContext,
  app,
  transactions,
  wallets,
} from '@app/contexts';
import {Modals} from '@app/screens/modals';

import {App} from './app';
import {Color} from './colors';
import {StatusBarColor} from './components/ui';

export function AppWithProviders() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContext.Provider value={app}>
          <StatusBarColor backgroundColor={Color.bg1} />
          <TransactionsContext.Provider value={transactions}>
            <WalletsContext.Provider value={wallets}>
              <App />
              <Modals initialModal={{type: 'splash'}} />
            </WalletsContext.Provider>
          </TransactionsContext.Provider>
        </AppContext.Provider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
