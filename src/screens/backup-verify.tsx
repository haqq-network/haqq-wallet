import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {Spacer} from '../components/spacer';
import {IconButton} from '../components/ui';

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
  const [checked, setChecked] = useState<boolean>(false);

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
    const wallet = wallets.getWallet(route.params.address);

    wallet?.updateWallet({
      mnemonic_saved: true,
    });

    navigation.navigate('backupFinish');
  }, [navigation]);

  useEffect(() => {
    setChecked(selected.map(v => words.get(v)).join(' ') === mnemonic);
  }, [words, selected, mnemonic]);

  return (
    <Container>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {selected.map(k => (
          <IconButton
            key={k}
            style={{padding: 5}}
            onPress={() => {
              setSelected(s => s.filter(v => v !== k));
            }}>
            <Text>{words.get(k)}</Text>
          </IconButton>
        ))}
      </View>
      <View style={page.buttons}>
        {buttons.map(val => (
          <IconButton
            disabled={selected.includes(val)}
            key={val}
            style={{padding: 5}}
            onPress={() => {
              setSelected(sel => sel.concat(val));
            }}>
            <Text>{words.get(val)}</Text>
          </IconButton>
        ))}
      </View>
      <Spacer />
      <Button disabled={!checked} title="Done" onPress={onDone} />
    </Container>
  );
};

const page = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
