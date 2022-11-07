import React from 'react';

import {ActivityIndicator} from 'react-native';

import {createTheme} from '../../helpers/create-theme';
import {PopupContainer} from '../ui';

export const LedgerScanEmpty = () => {
  return (
    <PopupContainer style={styles.emptyContainer}>
      <ActivityIndicator style={styles.emptyActivity} />
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
});
