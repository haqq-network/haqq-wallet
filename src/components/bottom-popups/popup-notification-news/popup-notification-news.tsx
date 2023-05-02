import React, {useCallback} from 'react';

import {Alert, Dimensions, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  LottieWrap,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks/use-theme-selector';
import {I18N, getText} from '@app/i18n';
import {SHADOW_COLOR_1} from '@app/variables/common';

export type PopupNotificationTopicProps = {
  onClickSubscribe: () => void;
  onClickNotNow: () => void;
};

export const PopupNotificationNews = ({
  onClickSubscribe,
  onClickNotNow,
}: PopupNotificationTopicProps) => {
  const animation = useThemeSelector({
    dark: require('@assets/animations/notification-news-popup-dark.json'),
    light: require('@assets/animations/notification-news-popup-light.json'),
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
          onPress: onClickNotNow,
        },
      ],
    );
  }, [onClickNotNow]);

  return (
    <View style={styles.sub}>
      <View style={styles.imageWrapper}>
        <LottieWrap style={styles.image} autoPlay loop source={animation} />
      </View>
      <Text
        t7
        style={styles.title}
        i18n={I18N.popupNotificationNewsTitle}
        center
      />
      <Text
        t14
        i18n={I18N.popupNotificationNewsDescription}
        center
        color={Color.textBase2}
      />
      <Spacer height={20} />
      <Button
        i18n={I18N.popupNotificationNewsSubscribe}
        variant={ButtonVariant.contained}
        onPress={onClickSubscribe}
        style={styles.margin}
        size={ButtonSize.middle}
      />
      <Button
        i18n={I18N.popupNotificationNewsNotNow}
        variant={ButtonVariant.third}
        error
        onPress={onSkip}
        size={ButtonSize.middle}
        style={styles.margin}
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
