import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  GRAPHIC_BASE_4,
  PIN_BANNED_ATTEMPTS,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../../variables';
import {useApp} from '../../contexts/app';
import {RestorePassword} from '../restore-password';
import {Pin, PinInterface} from '../pin';

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
    <View style={{backgroundColor: '#ffffff', flex: 1, paddingTop: 110}}>
      <Pin
        ref={pinRef}
        title="Welcome to ISLM Wallet"
        onPin={onPin}
        additionButton={
          <TouchableOpacity
            style={page.additionButton}
            onPress={() => setShowRestore(true)}>
            <Text style={page.additionButtonText}>Forgot</Text>
            <Text style={page.additionButtonText}>the code</Text>
          </TouchableOpacity>
        }
      />
      {showRestore && <RestorePassword onClose={() => setShowRestore(false)} />}
    </View>
  );
};

const page = StyleSheet.create({
  container: {alignItems: 'center'},
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: GRAPHIC_BASE_4,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: TEXT_GREEN_1,
    transform: [{scale: 1}],
  },
  additionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionButtonText: {
    color: TEXT_BASE_2,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    padding: 2,
  },
  title: {marginBottom: 60},
});
