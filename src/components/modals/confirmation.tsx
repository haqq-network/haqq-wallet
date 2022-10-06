import React, {useRef} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {CopyConfirmation, Text} from '../ui';
import {BG_14, GRAPHIC_BASE_2, TEXT_SECOND_3} from '../../variables';

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
        <Text clean style={page.text}>
          {texts[action ?? '']}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  overlay: {justifyContent: 'center', alignItems: 'center', flex: 1},
  background: {
    backgroundColor: BG_14,
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
    color: TEXT_SECOND_3,
  },
});
