import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {BG_1, TEXT_BASE_2} from '../../variables';
import {useApp} from '../../contexts/app';
import {RestorePassword} from '../restore-password';
import {Pin, PinInterface} from '../pin';
import {Paragraph} from '../ui';

export type PinModalProps = {};

export const PinModal = () => {
  const app = useApp();
  const pinRef = useRef<PinInterface>();
  const [showRestore, setShowRestore] = useState(false);

  const onPin = useCallback(
    (pin: string) => {
      app
        .comparePin(pin)
        .then(() => {
          requestAnimationFrame(() => app.emit('enterPin', pin));
        })
        .catch(() => {
          pinRef.current?.reset('wrong pin');
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
            <Paragraph clean style={page.additionButtonText}>
              Forgot
            </Paragraph>
            <Paragraph clean style={page.additionButtonText}>
              the code
            </Paragraph>
          </TouchableOpacity>
        }
      />
      {showRestore && <RestorePassword onClose={() => setShowRestore(false)} />}
    </View>
  );
};

const page = StyleSheet.create({
  container: {backgroundColor: BG_1, flex: 1, paddingTop: 110},
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
});
