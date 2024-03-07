import React, {memo, useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {Platform, View} from 'react-native';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {Button, ButtonVariant, Spacer, Text} from '@app/components/ui';
import {createTheme, hideModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {sendNotification} from '@app/services';
import {RemoteConfig} from '@app/services/remote-config';
import {getAppVersion} from '@app/services/version';
import {Color} from '@app/theme';
import {ModalType, Modals} from '@app/types';

export const ViewErrorDetails = memo(
  ({errorDetails}: Modals[ModalType.viewErrorDetails]) => {
    const appVersion = useMemo(
      () =>
        getText(I18N.yourAppVersion, {
          version: getAppVersion(),
        }),
      [],
    );
    const remoteAppVersion = useMemo(
      () =>
        getText(I18N.remoteAppVersion, {
          version:
            Platform.select({
              ios: RemoteConfig.get('ios_version'),
              android: RemoteConfig.get('android_version'),
            }) || appVersion,
        }),
      [appVersion],
    );

    const onCopyPress = useCallback(() => {
      Clipboard.setString(
        `${errorDetails}\n${appVersion}\n${remoteAppVersion}`,
      );
      hideModal(ModalType.viewErrorDetails);
      sendNotification(I18N.notificationCopied);
    }, [errorDetails]);

    return (
      <BottomPopupContainer
        onPressOutContent={() => hideModal(ModalType.viewErrorDetails)}>
        {() => (
          <View style={styles.modalView}>
            <Text t14>{errorDetails}</Text>
            <Spacer height={12} />
            <View style={styles.versionContainer}>
              <View>
                <Text t14>{appVersion}</Text>
              </View>
              <View>
                <Text t14>{remoteAppVersion}</Text>
              </View>
            </View>
            <Spacer height={16} />
            <Button
              variant={ButtonVariant.second}
              title={getText(I18N.copy)}
              onPress={onCopyPress}
              style={styles.closeButton}
            />
          </View>
        )}
      </BottomPopupContainer>
    );
  },
);

const styles = createTheme({
  modalView: {
    alignItems: 'center',
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  versionContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: '100%',
    marginTop: 10,
  },
});
