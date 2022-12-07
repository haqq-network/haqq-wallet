import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export const LedgerScanHeader = () => {
  return (
    <View style={styles.container}>
      <Text
        t9
        center={true}
        color={Color.textBase1}
        i18n={I18N.ledgerScanTitle}
        style={styles.title}
      />
      <Text t14 center color={Color.textBase2}>
        <Text i18n={I18N.ledgerScanDescription1} />
        <Text
          t12
          color={Color.textBase2}
          i18n={I18N.ledgerScanDescription2}
        />,{' '}
        <Text t12 color={Color.textBase2} i18n={I18N.ledgerScanDescription3} />
        <Text i18n={I18N.ledgerScanDescription4} />
        <Text t12 color={Color.textBase2} i18n={I18N.ledgerScanDescription5} />
        <Text i18n={I18N.ledgerScanDescription6} />
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
});
