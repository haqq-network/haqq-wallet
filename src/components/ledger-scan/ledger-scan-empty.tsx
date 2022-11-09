import {ActivityIndicator, StyleSheet} from 'react-native';
import React from 'react';
import {PopupContainer} from '../ui';

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
