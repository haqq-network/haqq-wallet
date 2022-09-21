import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Container,
  Paragraph,
  Spacer,
  Title,
} from '../components/ui';
import {
  BG_3,
  GRAPHIC_GREEN_1,
  TEXT_BASE_3,
  TEXT_RED_1,
  TEXT_SECOND_1,
} from '../variables';

type BackupVerifyScreenProp = CompositeScreenProps<any, any>;

export const BackupVerifyScreen = ({
  navigation,
  route,
}: BackupVerifyScreenProp) => {
  const wallets = useWallets();
  const mnemonic = useMemo(
    () => wallets.getWallet(route.params.address)?.wallet.mnemonic.phrase ?? '',
    [route.params.address, wallets],
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);

  const words = useMemo(
    () =>
      new Map(mnemonic.split(' ').map((value, pos) => [String(pos), value])),
    [mnemonic],
  );

  const buttons = useMemo(
    () => Array.from(words.keys()).sort(() => 0.5 - Math.random()),
    [words],
  );

  const onDone = useCallback(() => {
    if (selected.map(v => words.get(v)).join(' ') === mnemonic) {
      const wallet = wallets.getWallet(route.params.address);

      wallet?.updateWallet({
        mnemonic_saved: true,
      });

      navigation.navigate('backupFinish');
    } else {
      setSelected([]);
      setError(true);
    }
  }, [mnemonic, navigation, route.params.address, selected, wallets, words]);

  return (
    <Container>
      <Title style={{marginBottom: 4}}>Verify backup phrase</Title>
      {error ? (
        <Paragraph style={page.error}>
          Ooops, mistake in one of the words
        </Paragraph>
      ) : (
        <Paragraph style={{textAlign: 'center', marginBottom: 16}}>
          Please choose the correct backup phrase according to the serial number
        </Paragraph>
      )}
      <View style={page.cells}>
        <View>
          {Array.from(words.keys())
            .slice(0, 6)
            .map((k, i) =>
              selected.length > i ? (
                <View style={[page.cell, page.cellFilled]} key={`${k}_filled`}>
                  <Text style={[page.cellText, page.cellTextFilled]}>
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
                  <Text style={[page.cellText, page.cellTextEmpty]}>
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
                  <Text style={[page.cellText, page.cellTextFilled]}>
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
                  <Text style={[page.cellText, page.cellTextEmpty]}>
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
            style={{margin: 6}}
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
      />
    </Container>
  );
};

const page = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 28,
  },
  cells: {flexDirection: 'row', marginHorizontal: -8, marginBottom: 28},
  cell: {
    width: (Dimensions.get('window').width - 56) / 2,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderStyle: 'solid',
    borderColor: BG_3,
    borderWidth: 1,
  },
  cellEmpty: {backgroundColor: BG_3},
  cellFilled: {backgroundColor: GRAPHIC_GREEN_1},
  cellText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  cellTextEmpty: {color: TEXT_SECOND_1, textAlign: 'center'},
  cellTextFilled: {color: TEXT_BASE_3, textAlign: 'center'},
  error: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 11,
    textAlign: 'center',
    marginBottom: 16,
    color: TEXT_RED_1,
  },
});
