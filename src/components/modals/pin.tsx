import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Keyboard, TouchableOpacity, View} from 'react-native';

import {Pin, PinInterface} from '@app/components/pin/pin';
import {RestorePassword} from '@app/components/restore-password';
import {Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Color, Theme} from '@app/theme';
import {PIN_BANNED_ATTEMPTS} from '@app/variables/common';

export type PinModalProps = {};

export const PinModal = () => {
  const pinRef = useRef<PinInterface>();
  const [showRestore, setShowRestore] = useState(false);

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (app.pinBanned) {
      pinRef?.current?.locked(app.pinBanned);
    }
  }, [pinRef]);

  const onPin = useCallback(
    (pin: string) => {
      app
        .comparePin(pin)
        .then(() => {
          app.successEnter();
          requestAnimationFrame(() => app.emit('enterPin', pin));
        })
        .catch(() => {
          app.failureEnter();
          if (app.canEnter) {
            pinRef.current?.reset(
              getText(I18N.pinAttempts, {
                value: String(PIN_BANNED_ATTEMPTS - app.pinAttempts),
              }),
            );
          } else {
            pinRef.current?.locked(app.pinBanned);
          }
        });
    },
    [pinRef],
  );

  return (
    <View style={page.container} key={Theme.currentTheme} testID="pin">
      <Pin
        ref={pinRef}
        title={getText(I18N.modalPinTitle)}
        onPin={onPin}
        additionButton={
          <TouchableOpacity
            style={page.additionButton}
            onPress={() => setShowRestore(true)}>
            <Text
              t15
              center
              color={Color.textBase2}
              i18n={I18N.modalPinForgotCode}
              style={page.additionButtonText}
              testID="forgot_the_code"
            />
          </TouchableOpacity>
        }
      />
      {showRestore && <RestorePassword onClose={() => setShowRestore(false)} />}
    </View>
  );
};

const page = createTheme({
  container: {
    backgroundColor: Color.bg1,
    flex: 1,
    paddingTop: 110,
  },
  additionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionButtonText: {
    padding: 2,
  },
});
