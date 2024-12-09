import React, {useMemo, useState} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Icon,
  InfoBlock,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {AppTheme, WalletType} from '@app/types';

interface BackupWarningProps {
  onPressBackup: () => void;
  testID?: string;
  isSSS?: boolean;
}

export function BackupWarning({
  onPressBackup,
  testID,
  isSSS,
}: BackupWarningProps) {
  const [checked, setChecked] = useState(false);

  const onClickCheck = (val: boolean) => {
    vibrate(HapticEffects.impactLight);
    setChecked(val);
  };

  const theme = useTheme();
  const isSSSWallet =
    typeof isSSS === 'boolean'
      ? isSSS
      : Boolean(Wallet.getAll().find(w => w.type === WalletType.sss));

  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('@assets/animations/backup-start-dark.json');
    }
    return require('@assets/animations/backup-start-light.json');
  }, [theme]);

  const paragraph = useMemo(() => {
    return isSSSWallet
      ? I18N.backupSSSWarningParagraph
      : I18N.backupWarningParagraph;
  }, [isSSSWallet]);
  const infoBlock1 = useMemo(() => {
    return isSSSWallet
      ? I18N.backupSSSWarningInfoBlock1
      : I18N.backupWarningInfoBlock1;
  }, [isSSSWallet]);
  const infoBlock2 = useMemo(() => {
    return isSSSWallet
      ? I18N.backupSSSWarningInfoBlock2
      : I18N.backupWarningInfoBlock2;
  }, [isSSSWallet]);

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <Spacer style={styles.imageContainer}>
        <LottieWrap source={animation} style={styles.image} autoPlay loop />
      </Spacer>
      <Text
        variant={TextVariant.t4}
        style={styles.title}
        i18n={I18N.backupWarningTitle}
        position={TextPosition.center}
      />
      <Text
        variant={TextVariant.t11}
        style={styles.paragraph}
        color={Color.textBase2}
        i18n={paragraph}
        position={TextPosition.center}
      />
      <InfoBlock
        error
        style={styles.infoBlock1}
        icon={<Icon name="warning" color={Color.textYellow1} i24 />}
        i18n={infoBlock1}
      />
      <InfoBlock
        warning
        style={styles.infoBlock2}
        icon={<Icon name="warning" color={Color.textYellow1} i24 />}
        i18n={infoBlock2}
      />
      <View style={styles.agree}>
        <Checkbox
          value={checked}
          onPress={onClickCheck}
          testID={`${testID}_checkbox`}>
          <Text
            t13
            style={styles.agreeText}
            i18n={I18N.backupCreateRecoveryAgreement}
          />
        </Checkbox>
      </View>
      <Button
        variant={ButtonVariant.contained}
        style={styles.submit}
        i18n={I18N.backupWarningButton}
        onPress={onPressBackup}
        testID={`${testID}_next`}
        disabled={!checked}
      />
    </PopupContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  imageContainer: {justifyContent: 'center', alignItems: 'center'},
  image: {width: 200, height: 200},
  title: {marginBottom: 4},
  paragraph: {marginBottom: 20},
  infoBlock1: {marginBottom: 20},
  infoBlock2: {marginBottom: 34},
  submit: {marginVertical: 16},
  agree: {marginBottom: 4, flexDirection: 'row'},
  agreeText: {
    flex: 1,
    color: Color.textBase2,
    marginLeft: 12,
    marginBottom: 4,
  },
});
