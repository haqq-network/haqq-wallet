import React, {useCallback, useEffect, useRef, useState} from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Pin, PinInterface} from '@app/components/pin/pin';
import {RestorePassword} from '@app/components/restore-password';
import {Text} from '@app/components/ui';
import {useApp, useThematicStyles} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {PIN_BANNED_ATTEMPTS} from '@app/variables/common';

export type PinModalProps = {};

export const PinModal = () => {
  const app = useApp();
  const pinRef = useRef<PinInterface>();
  const [showRestore, setShowRestore] = useState(false);
  const styles = useThematicStyles(stylesObj);
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

  return (
    <View style={styles.container}>
      <Pin
        ref={pinRef}
        title={getText(I18N.modalPinTitle)}
        onPin={onPin}
        additionButton={
          <TouchableOpacity
            style={styles.additionButton}
            onPress={() => setShowRestore(true)}>
            <Text
              clean
              i18n={I18N.modalPinForgotCode}
              style={styles.additionButtonText}
            />
          </TouchableOpacity>
        }
      />
      {showRestore && <RestorePassword onClose={() => setShowRestore(false)} />}
    </View>
  );
};

const stylesObj = StyleSheet.create({
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
