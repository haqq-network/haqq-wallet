import React, {useCallback, useMemo} from 'react';

import {Alert, Dimensions, Image, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {useThematicStyles, useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {SHADOW_COLOR_1} from '@app/variables/common';

export type BackupNotificationProps = {
  onClickBackup: () => void;
  onClickSkip: () => void;
};

export const BackupNotification = ({
  onClickBackup,
  onClickSkip,
}: BackupNotificationProps) => {
  const {isDark} = useTheme();
  const styles = useThematicStyles(stylesObj);
  const warningImage = useMemo(() => {
    if (isDark) {
      return require('../../../../assets/images/backup-notification-dark.png');
    }

    return require('../../../../assets/images/backup-notification-light.png');
  }, [isDark]);

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
    <View style={styles.sub}>
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
      />
      <Button
        i18n={I18N.backupNotificationSkip}
        variant={ButtonVariant.third}
        error
        onPress={onSkip}
        size={ButtonSize.middle}
        style={styles.margin}
      />
    </View>
  );
};

const stylesObj = StyleSheet.create({
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
    width: Dimensions.get('window').width - 80,
  },
  imageWrapper: {
    backgroundColor: Color.bg1,

    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
  },
});
