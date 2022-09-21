import React, {useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CopyConfirmation} from '../ui';
import {GRAPHIC_BASE_2} from '../../variables';

export enum ConfirmationBadgeActions {
  copied = 'copied',
}

const texts = {
  [ConfirmationBadgeActions.copied]: 'Copied',
};

export type ConfirmationModalProps = {
  action: ConfirmationBadgeActions;
  onClose: () => void;
};

export const ConfirmationModal = ({
  action,
  onClose,
}: ConfirmationModalProps) => {
  const onCloseModal = () => {
    onClose();
    clearTimeout(timer.current);
  };

  const timer = useRef(
    setTimeout(() => {
      onCloseModal();
    }, 2000),
  );

  return (
    <TouchableOpacity onPress={onCloseModal} style={page.overlay}>
      <View style={page.background}>
        <CopyConfirmation color={GRAPHIC_BASE_2} style={page.icon} />
        <Text style={page.text}>{texts[action ?? '']}</Text>
      </View>
    </TouchableOpacity>
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
    color: '#65666A',
  },
});
