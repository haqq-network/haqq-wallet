import React, {useCallback, useEffect, useRef, useState} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Pin, PinInterface} from '@app/components/pin/pin';
import {RestorePassword} from '@app/components/restore-password';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useApp} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {PIN_BANNED_ATTEMPTS} from '@app/variables';

export type PinModalProps = {};

export const PinModal = () => {
  const app = useApp();
  const pinRef = useRef<PinInterface>();
  const [showRestore, setShowRestore] = useState(false);

  useEffect(() => {
    if (app.pinBanned) {
      pinRef?.current?.locked(app.pinBanned);
    }
  }, [app, pinRef]);

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
              `wrong pin ${PIN_BANNED_ATTEMPTS - app.pinAttempts} left`,
            );
          } else {
            pinRef.current?.locked(app.pinBanned);
          }
        });
    },
    [app, pinRef],
  );
  const onLock = useCallback(() => {
    setShowRestore(true);
  }, []);

  return (
    <View style={page.container}>
      <Pin
        ref={pinRef}
        title={getText(I18N.modalPinTitle)}
        onPin={onPin}
        onLock={onLock}
        additionButton={
          <TouchableOpacity
            style={page.additionButton}
            onPress={() => setShowRestore(true)}>
            <Text
              clean
              i18n={I18N.modalPinForgotCode}
              style={page.additionButtonText}
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
    color: Color.textBase2,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    padding: 2,
  },
});
