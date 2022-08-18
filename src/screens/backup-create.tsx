import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Copy,
  IconButton,
  InfoBlock,
  InfoBlockType,
  Paragraph,
  Title,
} from '../components/ui';
import {Spacer} from '../components/spacer';
import {useWallets} from '../contexts/wallets';
import {BG_3, TEXT_BASE_2, TEXT_GREEN_1} from '../variables';
import {MnemonicWord} from '../components/mnemonic-word';
import Clipboard from '@react-native-clipboard/clipboard';

type BackupCreateScreenProp = CompositeScreenProps<any, any>;

export const BackupCreateScreen = ({
  navigation,
  route,
}: BackupCreateScreenProp) => {
  const [checked, setChecked] = useState(false);

  const wallets = useWallets();
  const wallet = useMemo(
    () => wallets.getWallet(route.params.address),
    [route.params.address, wallets],
  );

  const onPressCopy = useCallback(() => {
    Clipboard.setString(wallet?.wallet.mnemonic.phrase ?? '');
  }, [wallet]);

  return (
    <Container>
      <Title>Your recovery phrase</Title>
      <Paragraph>
        Write down or copy these words in the right order and save them
        somewhere safe.
      </Paragraph>
      <Spacer style={{justifyContent: 'center'}}>
        <View style={page.mnemonics}>
          <View style={page.column}>
            {wallet?.wallet.mnemonic.phrase
              .split(' ')
              .slice(0, 6)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 1} />
              ))}
          </View>
          <View style={page.column}>
            {wallet?.wallet.mnemonic.phrase
              .split(' ')
              .slice(6, 12)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 7} />
              ))}
          </View>
        </View>
        <IconButton
          onPress={onPressCopy}
          style={{
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 32,
            marginHorizontal: 4,
          }}>
          <Copy color={TEXT_GREEN_1} />
          <Text
            style={{
              color: TEXT_GREEN_1,
              fontWeight: '700',
              fontSize: 16,
              lineHeight: 22,
              marginHorizontal: 4,
            }}>
            Copy
          </Text>
        </IconButton>
      </Spacer>
      <InfoBlock type={InfoBlockType.warning} style={{marginBottom: 20}}>
        If you lose your recovery phrase, you will be unable to access your
        funds, as nobody will be able to restore it.
      </InfoBlock>
      <View style={{marginBottom: 20, flexDirection: 'row'}}>
        <Checkbox value={checked} onPress={setChecked} />
        <Text
          style={{
            flex: 1,
            color: TEXT_BASE_2,
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 18,
            marginLeft: 12,
          }}>
          I understand that if I lose my recovery phrase, I will not be able to
          restore access to my account
        </Text>
      </View>
      <Button
        title="Continue"
        variant={ButtonVariant.contained}
        disabled={!checked}
        onPress={() =>
          navigation.navigate('backupVerify', {address: route.params.address})
        }
      />
    </Container>
  );
};

const page = StyleSheet.create({
  mnemonics: {
    backgroundColor: BG_3,
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
  },
  column: {flex: 1},
});
