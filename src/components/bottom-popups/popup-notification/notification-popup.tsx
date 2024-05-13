import React, {useCallback, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  LottieWrap,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {SHADOW_L} from '@app/variables/shadows';

export type NotificationPopupProps = {
  onClickTurnOn: () => Promise<void>;
  onClickNotNow: () => Promise<void>;
};

export const NotificationPopup = ({
  onClickTurnOn,
  onClickNotNow,
}: NotificationPopupProps) => {
  const [inProgress, setInProgress] = useState(false);
  const lottieAnimation = useThemeSelector({
    dark: require('@assets/animations/notification-popup-dark.json'),
    light: require('@assets/animations/notification-popup-light.json'),
  });

  const onPressTurnOn = useCallback(async () => {
    setInProgress(true);
    await onClickTurnOn();
    setInProgress(false);
  }, [onClickTurnOn]);

  return (
    <View style={styles.sub}>
      <View style={styles.imageWrapper}>
        <LottieWrap
          style={styles.lottie}
          source={lottieAnimation}
          autoPlay
          loop={false}
        />
      </View>
      <Text t7 center style={styles.title} i18n={I18N.popupNotificationTitle} />
      <Text
        t14
        center
        color={Color.textBase2}
        style={styles.t14}
        i18n={I18N.popupNotificationDescription}
      />
      <Button
        i18n={I18N.popupNotificationTurnOn}
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        onPress={onPressTurnOn}
        style={styles.margin}
        loading={inProgress}
      />
      <Button
        i18n={I18N.popupNotificationNotNow}
        variant={ButtonVariant.text}
        size={ButtonSize.middle}
        onPress={onClickNotNow}
      />
    </View>
  );
};

const styles = createTheme({
  sub: {
    marginHorizontal: 16,
    marginVertical: 35,
    backgroundColor: Color.bg1,
    flex: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 16,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  t14: {
    marginBottom: 28,
  },
  margin: {marginBottom: 8},
  imageWrapper: {
    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...SHADOW_L,
  },
  lottie: {
    height: 64,
    width: 295,
  },
});
