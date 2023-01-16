import React, {useMemo} from 'react';

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
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';
import {SHADOW_COLOR_1} from '@app/variables/common';

export type NotificationPopupProps = {
  onClickTurnOn: () => void;
  onClickNotNow: () => void;
};

export const NotificationPopup = ({
  onClickTurnOn,
  onClickNotNow,
}: NotificationPopupProps) => {
  const theme = useTheme();

  const lottieAnimation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('@assets/animations/notification-popup-dark.json');
    }
    return require('@assets/animations/notification-popup-light.json');
  }, [theme]);

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
        onPress={onClickTurnOn}
        style={styles.margin}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lottie: {
    width: '100%',
  },
});
