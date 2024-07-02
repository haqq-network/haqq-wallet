import React, {useCallback} from 'react';

import {Alert, Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks/use-theme-selector';
import {I18N, getText} from '@app/i18n';

export type BackupSssNotificationProps = {
  onClickBackup: () => Promise<void>;
  onClickSkip: () => Promise<void>;
};

export const BackupSssSuggestion = ({
  onClickBackup,
  onClickSkip,
}: BackupSssNotificationProps) => {
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

  const suggestionImage = useThemeSelector({
    dark: require('@assets/images/backup-sss-suggestion-dark.png'),
    light: require('@assets/images/backup-sss-suggestion-light.png'),
  });

  const onBackup = useCallback(async () => {
    onClickBackup();
  }, [onClickBackup]);

  return (
    <View style={styles.sub} testID="backup_sss_suggestion">
      <Image source={suggestionImage} style={styles.suggestionImage} />
      <Spacer height={20} />
      <Text
        variant={TextVariant.t7}
        position={TextPosition.center}
        i18n={I18N.backupSssSuggestionTitle}
      />
      <Spacer height={5} />
      <Text
        variant={TextVariant.t14}
        color={Color.textBase2}
        position={TextPosition.center}
        i18n={I18N.backupSssSuggestionDescription}
      />
      <Spacer height={20} />
      <Button
        i18n={I18N.backupSssSuggestionConnect}
        variant={ButtonVariant.contained}
        onPress={onBackup}
        style={styles.margin}
        size={ButtonSize.middle}
      />
      <Button
        i18n={I18N.backupSssSuggestionCancel}
        variant={ButtonVariant.third}
        onPress={onSkip}
        size={ButtonSize.middle}
        style={styles.margin}
        testID="backup_sss_suggestion_skip_button"
      />
    </View>
  );
};

const styles = createTheme({
  suggestionImage: {
    alignSelf: 'center',
  },
  sub: {
    marginHorizontal: 16,
    marginVertical: 42,
    backgroundColor: Color.bg1,
    flex: 0,
    padding: 24,
    borderRadius: 16,
    paddingBottom: 16,
  },
  margin: {marginBottom: 8},
});
