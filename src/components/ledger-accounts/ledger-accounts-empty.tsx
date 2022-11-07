import React from 'react';

import {ActivityIndicator} from 'react-native';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {PopupContainer, Text} from '../ui';

export const LedgerAccountsEmpty = () => {
  return (
    <PopupContainer style={styles.emptyContainer}>
      <ActivityIndicator style={styles.emptyActivity} />
      <Text t9 style={styles.emptyTitle}>
        Waiting for confirmation of pairing
      </Text>
      <Text t14 style={styles.emptyDescription}>
        Confirm pairing on your Ledger
      </Text>
    </PopupContainer>
  );
};

const styles = createTheme({
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActivity: {
    marginBottom: 45,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    color: Color.textBase2,
    textAlign: 'center',
  },
});
