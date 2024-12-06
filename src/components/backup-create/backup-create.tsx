import React from 'react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  InfoBlock,
  MnemonicTable,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

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
      <Button
        i18n={I18N.continue}
        style={page.submit}
        variant={ButtonVariant.contained}
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
  submit: {marginVertical: 16},
  t4: {
    alignSelf: 'center',
    alignItems: 'center',
  },
});
