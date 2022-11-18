import React, {useCallback, useMemo, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {EmptyCell} from '@app/components/backup-verify/empty-cell';
import {FilledCell} from '@app/components/backup-verify/filled-cell';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shuffleWords} from '@app/utils';

export type BackupVerifyProps = {
  error: boolean;
  phrase: string;
  onDone: (phrase: string) => void;
};

export const BackupVerify = ({error, phrase, onDone}: BackupVerifyProps) => {
  const words = useMemo(
    () => new Map(phrase.split(' ').map((value, pos) => [String(pos), value])),
    [phrase],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const buttons = useMemo(() => shuffleWords(words), [words]);

  const onPressDone = useCallback(() => {
    onDone(selected.map(v => words.get(v)).join(' '));
  }, [onDone, selected, words]);

  const onPressWord = useCallback(
    (val: string) => () => {
      vibrate(HapticEffects.impactLight);
      setSelected(sel => sel.concat(val));
    },
    [],
  );

  return (
    <PopupContainer style={styles.container}>
      <Text t4 style={styles.title}>
        {getText(I18N.backupVerifyTitle)}
      </Text>
      {error ? (
        <Text t11 style={styles.error}>
          {getText(I18N.backupVerifyError)}
        </Text>
      ) : (
        <Text t11 style={styles.textStyle}>
          {getText(I18N.backupVerifyDescription)}
        </Text>
      )}
      <View style={styles.cells}>
        <View>
          {Array.from(words.keys())
            .slice(0, 6)
            .map((k, i) =>
              selected.length > i ? (
                <FilledCell
                  word={words.get(selected[i]) ?? ''}
                  key={`${i}_filled`}
                />
              ) : (
                <EmptyCell
                  active={selected.length === i}
                  index={i + 1}
                  key={`${i}_empty`}
                />
              ),
            )}
        </View>
        <View>
          {Array.from(words.keys())
            .slice(6, 12)
            .map((k, i) =>
              selected.length > i + 6 ? (
                <FilledCell
                  word={words.get(selected[i + 6]) ?? ''}
                  key={`${i}_filled`}
                />
              ) : (
                <EmptyCell
                  active={selected.length === i + 6}
                  index={i + 7}
                  key={`${i}_empty`}
                />
              ),
            )}
        </View>
      </View>
      <View style={styles.buttons}>
        {buttons.map(val => (
          <Button
            size={ButtonSize.small}
            variant={ButtonVariant.second}
            disabled={selected.includes(val)}
            key={val}
            style={styles.buttonStyle}
            title={words.get(val) ?? ''}
            onPress={onPressWord(val)}
          />
        ))}
      </View>
      <Spacer />
      <Button
        disabled={selected.length < 12}
        variant={ButtonVariant.contained}
        title={getText(I18N.backupVerifyCheck)}
        onPress={onPressDone}
        style={styles.margin}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
  title: {marginTop: 20, marginBottom: 4, textAlign: 'center'},
  textStyle: {
    textAlign: 'center',
    marginBottom: 16,
    color: Color.graphicBase1,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 28,
  },
  cells: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 28,
  },
  error: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 11,
    textAlign: 'center',
    marginBottom: 16,
    color: Color.textRed1,
  },
  buttonStyle: {margin: 6},
  margin: {marginVertical: 16},
});
