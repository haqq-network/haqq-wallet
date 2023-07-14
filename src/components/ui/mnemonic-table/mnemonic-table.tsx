import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {CopyButton} from '@app/components/ui/copy-button';
import {Icon} from '@app/components/ui/icon';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {MnemonicWord} from './mnemonic-word';

interface MnemonicTableProps {
  mnemonic: string;
}

export function MnemonicTable({mnemonic}: MnemonicTableProps) {
  const words = useMemo(() => mnemonic.split(' '), [mnemonic]);
  return (
    <>
      <View style={styles.mnemonics}>
        <View style={styles.column}>
          {words.slice(0, words.length / 2).map((t, i) => (
            <MnemonicWord key={`${t}${i}`} word={t} index={i + 1} />
          ))}
        </View>
        <View style={styles.column}>
          {mnemonic
            .split(' ')
            .slice(words.length / 2, words.length)
            .map((t, i) => (
              <MnemonicWord
                key={`${t}${i}`}
                word={t}
                index={i + words.length / 2 + 1}
              />
            ))}
        </View>
      </View>
      <CopyButton value={mnemonic ?? ''} style={styles.copy}>
        <Icon name="copy" i22 color={Color.textGreen1} />
        <Text t9 style={styles.copyText} i18n={I18N.copy} />
      </CopyButton>
    </>
  );
}

const styles = createTheme({
  mnemonics: {
    backgroundColor: Color.bg3,
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
  },
  column: {flex: 1},
  copy: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  copyText: {
    color: Color.textGreen1,
    marginHorizontal: 8,
  },
});
