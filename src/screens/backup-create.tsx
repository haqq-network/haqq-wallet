import React, {useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {Color, getColor} from '../colors';
import {MnemonicWord} from '../components/mnemonic-word';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Copy,
  CopyButton,
  InfoBlock,
  InfoBlockType,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {createTheme} from '../helpers/create-theme';
import {RootStackParamList} from '../types';

export const BackupCreateScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupCreate'>>();

  const [checked, setChecked] = useState(false);
  const wallet = useWallet(route.params.address);

  return (
    <PopupContainer style={page.container}>
      <Text t4 style={page.t4}>
        Your recovery phrase
      </Text>
      <Text t11 style={page.t11}>
        Write down or copy these words in the right order and save them
        somewhere safe.
      </Text>
      <Spacer style={page.space}>
        <View style={page.mnemonics}>
          <View style={page.column}>
            {wallet?.mnemonic
              .split(' ')
              .slice(0, 6)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 1} />
              ))}
          </View>
          <View style={page.column}>
            {wallet?.mnemonic
              .split(' ')
              .slice(6, 12)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 7} />
              ))}
          </View>
        </View>
        <CopyButton value={wallet?.mnemonic ?? ''} style={page.copy}>
          <Copy color={getColor(Color.textGreen1)} />
          <Text clean style={page.copyText}>
            Copy
          </Text>
        </CopyButton>
      </Spacer>
      <InfoBlock t15 type={InfoBlockType.warning} style={page.marginBottom}>
        If you lose your recovery phrase, you will be unable to access your
        funds, as nobody will be able to restore it.
      </InfoBlock>
      <View style={page.agree}>
        <Checkbox value={checked} onPress={setChecked}>
          <Text t14 style={page.agreeText}>
            I understand that if I lose my recovery phrase, I will not be able
            to restore access to my account
          </Text>
        </Checkbox>
      </View>
      <Button
        title="Continue"
        style={page.submit}
        variant={ButtonVariant.contained}
        disabled={!checked}
        onPress={() =>
          navigation.navigate('backupVerify', {address: route.params.address})
        }
      />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mnemonics: {
    backgroundColor: Color.bg3,
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
  },
  column: {flex: 1},
  marginBottom: {marginBottom: 20},
  space: {justifyContent: 'center'},
  agree: {marginBottom: 4, flexDirection: 'row'},
  agreeText: {
    flex: 1,
    color: Color.textBase2,
    fontWeight: '600',
    marginLeft: 12,
    marginBottom: 4,
  },
  submit: {marginVertical: 16},
  copy: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  copyText: {
    color: Color.textGreen1,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    marginHorizontal: 4,
  },
  t4: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  t11: {
    color: Color.textBase2,
    textAlign: 'center',
  },
});
