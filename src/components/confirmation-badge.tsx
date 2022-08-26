import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CopyConfirmation} from './ui';
import {GRAPHIC_BASE_2} from '../variables';
import {useApp} from '../contexts/app';

export enum ConfirmationBadgeActions {
  copied = 'copied',
}

const texts = {
  [ConfirmationBadgeActions.copied]: 'Copied',
};

const actions = Object.values(ConfirmationBadgeActions);

export const ConfirmationBadge = () => {
  const app = useApp();
  const [showNotification, setShowConfirmation] =
    useState<ConfirmationBadgeActions | null>(null);

  useEffect(() => {
    const subscription = (event: ConfirmationBadgeActions) => {
      if (actions.includes(event)) {
        setShowConfirmation(event);

        setTimeout(() => {
          setShowConfirmation(null);
        }, 5000);
      }
    };

    app.on('confirmation', subscription);

    return () => {
      app.off('confirmation', subscription);
    };
  }, [app]);

  return (
    <Modal animationType="fade" visible={!!showNotification} transparent={true}>
      <TouchableOpacity
        onPress={() => setShowConfirmation(null)}
        style={page.overlay}>
        <View style={page.background}>
          {showNotification && (
            <>
              <CopyConfirmation color={GRAPHIC_BASE_2} style={page.icon} />
              <Text style={page.text}>{texts[showNotification ?? '']}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const page = StyleSheet.create({
  overlay: {justifyContent: 'center', alignItems: 'center', flex: 1},
  background: {
    backgroundColor: 'rgba(229, 229, 234, 0.82)',
    width: 155,
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  icon: {marginBottom: 19},
  text: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
    letterSpacing: -0.32,
  },
});
