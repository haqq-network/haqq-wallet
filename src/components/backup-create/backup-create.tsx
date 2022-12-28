import React, {useState} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Copy,
  CopyButton,
  InfoBlock,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {useThematicStyles, useTheme, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {MnemonicWord} from './mnemonic-word';

interface BackupCreateProps {
  onSubmit?: () => void;
}

export const BackupCreate = ({onSubmit = () => {}}: BackupCreateProps) => {
  const {mnemonic} = useTypedRoute<'backupCreate'>().params;
  const styles = useThematicStyles(stylesObj);
  const {colors} = useTheme();

  const [checked, setChecked] = useState(false);

  const onClickCheck = (val: boolean) => {
    vibrate(HapticEffects.impactLight);
    setChecked(val);
  };

  return (
    <PopupContainer style={styles.container}>
      <Text t4 style={styles.t4} i18n={I18N.backupCreateRecoveryPhrase} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.backupCreateRecoverySaveWords}
      />
      <Spacer style={styles.space}>
        <View style={styles.mnemonics}>
          <View style={styles.column}>
            {mnemonic
              .split(' ')
              .slice(0, 6)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 1} />
              ))}
          </View>
          <View style={styles.column}>
            {mnemonic
              .split(' ')
              .slice(6, 12)
              .map((t, i) => (
                <MnemonicWord key={`${t}${i}`} word={t} index={i + 7} />
              ))}
          </View>
        </View>
        <CopyButton value={mnemonic ?? ''} style={styles.copy}>
          <Copy height={22} width={22} color={colors.textGreen1} />
          <Text t9 style={styles.copyText} i18n={I18N.copy} />
        </CopyButton>
      </Spacer>
      <InfoBlock
        i18n={I18N.backupCreateRecoveryWarningMessage}
        warning
        style={styles.marginBottom}
      />
      <View style={styles.agree}>
        <Checkbox value={checked} onPress={onClickCheck}>
          <Text
            t13
            style={styles.agreeText}
            i18n={I18N.backupCreateRecoveryAgreement}
          />
        </Checkbox>
      </View>
      <Button
        i18n={I18N.continue}
        style={styles.submit}
        variant={ButtonVariant.contained}
        disabled={!checked}
        onPress={onSubmit}
      />
    </PopupContainer>
  );
};

const stylesObj = StyleSheet.create({
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
