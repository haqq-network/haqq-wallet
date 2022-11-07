import React, {useCallback, useMemo, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Dimensions, View} from 'react-native';

import {Color} from '../colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {createTheme} from '../helpers/create-theme';
import {RootStackParamList} from '../types';

function shuffleWords(words: Map<string, string>) {
  return Array.from(words.keys()).sort(() => 0.5 - Math.random());
}

export const BackupVerifyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupVerify'>>();

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
    <PopupContainer style={page.container}>
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
                    selected.length === i && {
                      borderColor: Color.graphicGreen1,
                    },
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
                    selected.length === i + 6 && {
                      borderColor: Color.graphicGreen1,
                    },
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
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    marginHorizontal: 20,
  },
  title: {marginTop: 20, marginBottom: 4, textAlign: 'center'},
  textStyle: {
    textAlign: 'center',
    marginBottom: 16,
    color: Color.graphicBase2,
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
