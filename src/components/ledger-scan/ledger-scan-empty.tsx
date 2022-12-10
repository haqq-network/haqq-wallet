import React from 'react';

import {ActivityIndicator, StyleSheet} from 'react-native';

import {PopupContainer} from '@app/components/ui';

export const LedgerScanEmpty = () => {
  return (
    <PopupContainer style={styles.emptyContainer}>
      <ActivityIndicator style={styles.emptyActivity} />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActivity: {
    marginBottom: 45,
  },
});
