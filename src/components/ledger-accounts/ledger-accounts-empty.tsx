import React from 'react';

import {ActivityIndicator, StyleSheet} from 'react-native';

import {LIGHT_TEXT_BASE_2} from '../../variables';
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

const styles = StyleSheet.create({
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
    color: LIGHT_TEXT_BASE_2,
    textAlign: 'center',
  },
});
