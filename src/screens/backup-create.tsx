import React, {useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

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
import {RootStackParamList} from '../types';
import {LIGHT_BG_3, LIGHT_TEXT_BASE_2, LIGHT_TEXT_GREEN_1} from '../variables';

export const BackupCreateScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupCreate'>>();

  const [checked, setChecked] = useState(false);

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
            {route.params.mnemonic
              .split(' ')
              .slice(0, 6)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 1} />
              ))}
          </View>
          <View style={page.column}>
            {route.params.mnemonic
              .split(' ')
              .slice(6, 12)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 7} />
              ))}
          </View>
        </View>
        <CopyButton value={route.params.mnemonic ?? ''} style={page.copy}>
          <Copy color={LIGHT_TEXT_GREEN_1} />
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
          navigation.navigate('backupVerify', {
            rootAddress: route.params.rootAddress,
            mnemonic: route.params.mnemonic,
          })
        }
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mnemonics: {
    backgroundColor: LIGHT_BG_3,
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
    color: LIGHT_TEXT_BASE_2,
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
    color: LIGHT_TEXT_GREEN_1,
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
    color: LIGHT_TEXT_BASE_2,
    textAlign: 'center',
  },
});
