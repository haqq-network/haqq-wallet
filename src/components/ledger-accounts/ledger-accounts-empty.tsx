import React from 'react';

import {ActivityIndicator, StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {PopupContainer, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export const LedgerAccountsEmpty = () => {
  return (
    <PopupContainer style={styles.emptyContainer}>
      <ActivityIndicator style={styles.emptyActivity} />
      <Text
        t9
        center={true}
        i18n={I18N.ledgerAccountsWaiting}
        style={styles.emptyTitle}
      />
      <Text
        t14
        color={Color.textBase2}
        center={true}
        i18n={I18N.ledgerAccountsConfirm}
      />
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
  },
});
