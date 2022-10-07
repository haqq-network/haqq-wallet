import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallet} from '../contexts/wallets';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Container,
  Text,
  Spacer,
} from '../components/ui';
import {
  BG_3,
  GRAPHIC_BASE_2,
  GRAPHIC_GREEN_1,
  TEXT_BASE_3,
  TEXT_RED_1,
  TEXT_SECOND_1,
} from '../variables';

type BackupVerifyScreenProp = CompositeScreenProps<any, any>;

function shuffleWords(words: Map<string, string>) {
  return Array.from(words.keys()).sort(() => 0.5 - Math.random());
}

export const BackupVerifyScreen = ({
  navigation,
  route,
}: BackupVerifyScreenProp) => {
  const wallet = useWallet(route.params.address);

  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);

  const words = useMemo(
    () =>
      new Map(
        wallet?.mnemonic.split(' ').map((value, pos) => [String(pos), value]),
      ),
    [wallet],
  );

  const [buttons, setButton] = useState(shuffleWords(words));

  const onDone = useCallback(() => {
    if (selected.map(v => words.get(v)).join(' ') === wallet?.mnemonic) {
      if (wallet) {
        wallet.mnemonicSaved = true;
      }

      navigation.navigate('backupFinish');
    } else {
      setSelected([]);
      setError(true);
      setButton(shuffleWords(words));
    }
  }, [selected, wallet, words, navigation]);

  return (
    <Container>
      <Text t4 style={page.title}>
        Verify backup phrase
      </Text>
      {error ? (
        <Text t11 style={page.error}>
          Ooops, mistake in one of the words
        </Text>
      ) : (
        <Text t11 style={page.textStyle}>
          Please choose the correct backup phrase according to the serial number
        </Text>
      )}
      <View style={page.cells}>
        <View>
          {Array.from(words.keys())
            .slice(0, 6)
            .map((k, i) =>
              selected.length > i ? (
                <View style={[page.cell, page.cellFilled]} key={`${k}_filled`}>
                  <Text t14 style={page.cellTextFilled}>
                    {words.get(selected[i])}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    page.cell,
                    page.cellEmpty,
                    selected.length === i && {borderColor: GRAPHIC_GREEN_1},
                  ]}
                  key={`${k}_empty`}>
                  <Text t14 style={page.cellTextEmpty}>
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
                <View style={[page.cell, page.cellFilled]} key={`${k}_filled`}>
                  <Text t14 style={page.cellTextFilled}>
                    {words.get(selected[i + 6])}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    page.cell,
                    page.cellEmpty,
                    selected.length === i + 6 && {borderColor: GRAPHIC_GREEN_1},
                  ]}
                  key={`${k}_empty`}>
                  <Text t14 style={page.cellTextEmpty}>
                    #{i + 7}
                  </Text>
                </View>
              ),
            )}
        </View>
      </View>
      <View style={page.buttons}>
        {buttons.map(val => (
          <Button
            size={ButtonSize.small}
            variant={ButtonVariant.second}
            disabled={selected.includes(val)}
            key={val}
            style={page.buttonStyle}
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
        title="Check"
        onPress={onDone}
        style={page.margin}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  title: {marginTop: 20, marginBottom: 4, textAlign: 'center'},
  textStyle: {
    textAlign: 'center',
    marginBottom: 16,
    color: GRAPHIC_BASE_2,
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
    width: (Dimensions.get('window').width - 56) / 2,
    height: 30,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    borderStyle: 'solid',
    borderColor: BG_3,
    borderWidth: 1,
  },
  cellEmpty: {backgroundColor: BG_3},
  cellFilled: {backgroundColor: GRAPHIC_GREEN_1},
  cellTextEmpty: {fontWeight: '600', color: TEXT_SECOND_1, textAlign: 'center'},
  cellTextFilled: {fontWeight: '600', color: TEXT_BASE_3, textAlign: 'center'},
  error: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 11,
    textAlign: 'center',
    marginBottom: 16,
    color: TEXT_RED_1,
  },
  buttonStyle: {margin: 6},
  margin: {marginVertical: 16},
});
