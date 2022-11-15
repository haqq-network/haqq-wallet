import React, {useCallback, useMemo, useState} from 'react';

import {Dimensions, View} from 'react-native';

import {Color} from '@app/colors';
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
                <View
                  style={[styles.cell, styles.cellFilled]}
                  key={`${k}_filled`}>
                  <Text t14 style={styles.cellTextFilled}>
                    {words.get(selected[i])}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.cell,
                    styles.cellEmpty,
                    selected.length === i && styles.cellActive,
                  ]}
                  key={`${k}_empty`}>
                  <Text t14 style={styles.cellTextEmpty}>
                    #{i + 1}
                  </Text>
                </View>
              ),
            )}
        </View>
        <View>
          {Array.from(words.keys())
            .slice(6, 12)
            .map((k, i) =>
              selected.length > i + 6 ? (
                <View
                  style={[styles.cell, styles.cellFilled]}
                  key={`${k}_filled`}>
                  <Text t14 style={styles.cellTextFilled}>
                    {words.get(selected[i + 6])}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.cell,
                    styles.cellEmpty,
                    selected.length === i + 6 && styles.cellActive,
                  ]}
                  key={`${k}_empty`}>
                  <Text t14 style={styles.cellTextEmpty}>
                    #{i + 7}
                  </Text>
                </View>
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
            onPress={() => {
              setSelected(sel => sel.concat(val));
            }}
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
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    width: (Dimensions.get('window').width - 56) / 2,
    height: 30,
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    borderStyle: 'solid',
    borderColor: Color.bg3,
    borderWidth: 1,
  },
  cellEmpty: {backgroundColor: Color.bg3},
  cellFilled: {backgroundColor: Color.graphicGreen1},
  cellTextEmpty: {
    fontWeight: '600',
    color: Color.textSecond1,
    textAlign: 'center',
  },
  cellTextFilled: {
    fontWeight: '600',
    color: Color.textBase3,
    textAlign: 'center',
  },
  cellActive: {
    borderColor: Color.graphicGreen1,
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
