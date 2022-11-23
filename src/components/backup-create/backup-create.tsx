import React, {useState} from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {MnemonicWord} from '@app/components/backup-create/mnemonic-word';
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
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

interface BackupCreateProps {
  onSubmit?: () => void;
}

export const BackupCreate = ({onSubmit = () => {}}: BackupCreateProps) => {
  const {mnemonic} = useTypedRoute<'backupCreate'>().params;

  const [checked, setChecked] = useState(false);

  const onClickCheck = (val: boolean) => {
    vibrate(HapticEffects.impactLight);
    setChecked(val);
  };

  return (
    <PopupContainer style={page.container}>
      <Text t4 style={page.t4} i18n={I18N.backupCreateRecoveryPhrase} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.backupCreateRecoverySaveWords}
      />
      <Spacer style={page.space}>
        <View style={page.mnemonics}>
          <View style={page.column}>
            {mnemonic
              .split(' ')
              .slice(0, 6)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 1} />
              ))}
          </View>
          <View style={page.column}>
            {mnemonic
              .split(' ')
              .slice(6, 12)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 7} />
              ))}
          </View>
        </View>
        <CopyButton value={mnemonic ?? ''} style={page.copy}>
          <Copy height={22} width={22} color={getColor(Color.textGreen1)} />
          <Text t9 style={page.copyText} i18n={I18N.copy} />
        </CopyButton>
      </Spacer>
      <InfoBlock
        i18n={I18N.backupCreateRecoveryWarningMessage}
        t15
        type={InfoBlockType.warning}
        style={page.marginBottom}
      />
      <View style={page.agree}>
        <Checkbox value={checked} onPress={onClickCheck}>
          <Text
            t13
            style={page.agreeText}
            i18n={I18N.backupCreateRecoveryAgreement}
          />
        </Checkbox>
      </View>
      <Button
        i18n={I18N.continue}
        style={page.submit}
        variant={ButtonVariant.contained}
        disabled={!checked}
        onPress={onSubmit}
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
    marginHorizontal: 8,
  },
  t4: {
    alignSelf: 'center',
    alignItems: 'center',
  },
});
