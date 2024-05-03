import React, {useCallback} from 'react';

import {Alert, Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, getWindowWidth} from '@app/helpers';
import {useThemeSelector} from '@app/hooks/use-theme-selector';
import {I18N, getText} from '@app/i18n';
import {SHADOW_L} from '@app/variables/shadows';

export type BackupNotificationProps = {
  onClickBackup: () => void;
  onClickSkip: () => void;
  testID: string;
};

export const BackupNotification = ({
  onClickBackup,
  onClickSkip,
  testID,
}: BackupNotificationProps) => {
  const warningImage = useThemeSelector({
    dark: require('@assets/images/backup-notification-dark.png'),
    light: require('@assets/images/backup-notification-light.png'),
  });

  const onSkip = useCallback(() => {
    return Alert.alert(
      getText(I18N.backupNotificationAlertTitle),
      getText(I18N.backupNotificationAlertDescription),
      [
        {
          text: getText(I18N.cancel),
          style: 'cancel',
        },
        {
          text: getText(I18N.accept),
          style: 'destructive',
          onPress: onClickSkip,
        },
      ],
    );
  }, [onClickSkip]);

  return (
    <View style={styles.sub} testID={testID}>
      <View style={styles.imageWrapper}>
        <Image
          resizeMode="contain"
          source={warningImage}
          style={styles.image}
        />
      </View>
      <Text
        t7
        style={styles.title}
        i18n={I18N.backupNotificationTitle}
        center
      />
      <Text
        t14
        i18n={I18N.backupNotificationDescription}
        center
        color={Color.textBase2}
      />
      <Spacer height={20} />
      <Button
        i18n={I18N.backupNotificationBackup}
        variant={ButtonVariant.contained}
        onPress={onClickBackup}
        style={styles.margin}
        size={ButtonSize.middle}
        testID={`${testID}_backup`}
      />
      <Button
        i18n={I18N.backupNotificationSkip}
        variant={ButtonVariant.third}
        error
        onPress={onSkip}
        size={ButtonSize.middle}
        style={styles.margin}
        testID={`${testID}_skip`}
      />
    </View>
  );
};

const styles = createTheme({
  sub: {
    marginHorizontal: 16,
    marginVertical: 42,
    backgroundColor: Color.bg1,
    flex: 0,
    padding: 24,
    borderRadius: 16,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  margin: {marginVertical: 8},
  image: {
    width: () => getWindowWidth() - 80,
  },
  imageWrapper: {
    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 12,
    ...SHADOW_L,
  },
});
