import React, {memo, useCallback} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {Button, ButtonVariant, Spacer, Text} from '@app/components/ui';
import {createTheme, hideModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {sendNotification} from '@app/services';
import {ModalType, Modals} from '@app/types';

export const ViewErrorDetails = memo(
  ({errorDetails}: Modals[ModalType.viewErrorDetails]) => {
    const onCopyPress = useCallback(() => {
      Clipboard.setString(errorDetails);
      hideModal(ModalType.viewErrorDetails);
      sendNotification(I18N.notificationCopied);
    }, [errorDetails]);

    return (
      <BottomPopupContainer
        onPressOutContent={() => hideModal(ModalType.viewErrorDetails)}>
        {() => (
          <View style={styles.modalView}>
            <Text>{errorDetails}</Text>
            <Spacer height={24} />
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
  closeButton: {
    width: '100%',
    marginTop: 10,
  },
});
