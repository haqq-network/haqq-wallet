import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';

import {MnemonicTable, Spacer, Text} from '../ui';

interface SettingsViewRecoveryPhraseProps {
  mnemonic: string;
}

export const SettingsViewRecoveryPhrase = ({
  mnemonic,
}: SettingsViewRecoveryPhraseProps) => {
  return (
    <View style={styles.container}>
      <Spacer height={20} />
      <Text t4 center i18n={I18N.backupCreateRecoveryPhrase} />
      <Spacer height={4} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.backupCreateRecoverySaveWords}
      />
      <Spacer height={20} />

      <MnemonicTable mnemonic={mnemonic} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});
