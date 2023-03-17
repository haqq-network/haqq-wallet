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
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks/use-theme-selector';
import {I18N, getText} from '@app/i18n';

export type BackupMpcNotificationProps = {
  onClickBackup: () => Promise<void>;
  onClickSkip: () => Promise<void>;
};

export const BackupMpcSuggestion = ({
  onClickBackup,
  onClickSkip,
}: BackupMpcNotificationProps) => {
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
    dark: require('@assets/images/backup-mpc-suggestion-dark.png'),
    light: require('@assets/images/backup-mpc-suggestion-light.png'),
  });

  return (
    <View style={styles.sub}>
      <Image source={suggestionImage} style={styles.suggestionImage} />
      <Spacer height={20} />
      <Text t7 center i18n={I18N.backupMpcSuggestionTitle} />
      <Spacer height={5} />
      <Text
        t14
        color={Color.textBase2}
        center
        i18n={I18N.backupMpcSuggestionDescription}
      />
      <Spacer height={20} />
      <Button
        i18n={I18N.backupMpcSuggestionConnect}
        variant={ButtonVariant.contained}
        onPress={onClickBackup}
        style={styles.margin}
        size={ButtonSize.middle}
      />
      <Button
        i18n={I18N.backupMpcSuggestionCancel}
        variant={ButtonVariant.third}
        onPress={onSkip}
        size={ButtonSize.middle}
        style={styles.margin}
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
