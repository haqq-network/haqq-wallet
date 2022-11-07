import React, {useCallback, useEffect, useRef, useState} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '../../colors';
import {useApp} from '../../contexts/app';
import {createTheme} from '../../helpers/create-theme';
import {PIN_BANNED_ATTEMPTS} from '../../variables';
import {Pin, PinInterface} from '../pin';
import {RestorePassword} from '../restore-password';
import {Text} from '../ui';

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

  return (
    <View style={page.container}>
      <Pin
        ref={pinRef}
        title="Welcome to ISLM Wallet"
        onPin={onPin}
        additionButton={
          <TouchableOpacity
            style={page.additionButton}
            onPress={() => setShowRestore(true)}>
            <Text clean style={page.additionButtonText}>
              Forgot
            </Text>
            <Text clean style={page.additionButtonText}>
              the code
            </Text>
          </TouchableOpacity>
        }
      />
      {showRestore && <RestorePassword onClose={() => setShowRestore(false)} />}
    </View>
  );
};

const page = createTheme({
  container: {backgroundColor: Color.bg1, flex: 1, paddingTop: 110},
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
