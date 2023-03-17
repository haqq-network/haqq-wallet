import React, {useCallback, useMemo} from 'react';

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
import {useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {AppTheme} from '@app/types';

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

  const theme = useTheme();
  const suggestionImage = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('@assets/images/backup-mpc-suggestion-dark.png');
    }

    return require('@assets/images/backup-mpc-suggestion-light.png');
  }, [theme]);

  return (
    <View style={styles.sub}>
      <Image source={suggestionImage} style={styles.suggestionImage} />
      <Spacer height={20} />
      <Text t7 center>
        Make your account safer - connect it to the social network
      </Text>
      <Spacer height={5} />
      <Text t14 color={Color.textBase2} center>
        If you lose access to your account, you can always restore it using your
        social network
      </Text>
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
