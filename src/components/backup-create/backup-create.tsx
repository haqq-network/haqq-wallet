import React, {useState} from 'react';

import {View} from 'react-native';

import {
  Button,
  ButtonVariant,
  Checkbox,
  InfoBlock,
  MnemonicTable,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Color} from '@app/theme';

interface BackupCreateProps {
  onSubmit: () => void;
  mnemonic: string;
  testID: string;
}

export const BackupCreate = ({
  mnemonic,
  onSubmit,
  testID,
}: BackupCreateProps) => {
  const [checked, setChecked] = useState(false);

  const onClickCheck = (val: boolean) => {
    vibrate(HapticEffects.impactLight);
    setChecked(val);
  };

  return (
    <PopupContainer style={page.container} testID={testID}>
      <Text t4 style={page.t4} i18n={I18N.backupCreateRecoveryPhrase} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.backupCreateRecoverySaveWords}
      />
      <Spacer style={page.space}>
        <MnemonicTable mnemonic={mnemonic} testID={`${testID}_mnemonic`} />
      </Spacer>
      <InfoBlock
        i18n={I18N.backupCreateRecoveryWarningMessage}
        warning
        style={page.marginBottom}
      />
      <View style={page.agree}>
        <Checkbox
          value={checked}
          onPress={onClickCheck}
          testID={`${testID}_checkbox`}>
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
        testID={`${testID}_next`}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
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
  t4: {
    alignSelf: 'center',
    alignItems: 'center',
  },
});
