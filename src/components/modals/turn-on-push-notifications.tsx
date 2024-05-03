import React, {memo, useCallback} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {PushNotifications} from '@app/services/push-notifications';
import {ModalType, Modals} from '@app/types';

export const TurnOnPushNotificationsModal = memo(
  ({onClose}: Modals[ModalType.turnOnPushNotifications]) => {
    const showPushNotificationAlert = useCallback(
      async (closeAction: () => void) => {
        await PushNotifications.instance.requestPermissions();
        closeAction();
      },
      [],
    );
    const animation = useThemeSelector({
      light: require('@assets/animations/turn-on-push-notifications-light.json'),
      dark: require('@assets/animations/turn-on-push-notifications-dark.json'),
    });

    return (
      <BottomPopupContainer>
        {onClosePopup => (
          <View style={styles.modalView}>
            {/* Animation on top */}
            <Spacer height={20} />
            <LottieWrap
              style={styles.animation}
              source={animation}
              autoPlay
              loop={true}
            />

            {/* Content */}
            <Spacer height={20} />
            <Text
              variant={TextVariant.t7}
              position={TextPosition.center}
              i18n={I18N.turnOnPushNotificationsTitle}
            />
            <Spacer height={8} />
            <Text
              variant={TextVariant.t14}
              position={TextPosition.center}
              i18n={I18N.turnOnPushNotificationsDescription}
              color={Color.textBase2}
            />
            <Spacer height={28} />
            <Button
              style={styles.button}
              variant={ButtonVariant.contained}
              i18n={I18N.turnOnPushNotificationsActionButton}
              testID="push_notifications_enable"
              onPress={() =>
                showPushNotificationAlert(() => onClosePopup(onClose))
              }
            />
            <Spacer height={16} />
            <Button
              style={styles.button}
              i18n={I18N.turnOnPushNotificationsSkip}
              testID="push_notifications_skip"
              onPress={() => onClosePopup(onClose)}
            />
          </View>
        )}
      </BottomPopupContainer>
    );
  },
);

const styles = createTheme({
  animation: {
    height: 64,
    width: 295,
  },
  button: {width: '100%'},
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
});
