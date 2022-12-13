import React, {useEffect} from 'react';

import {StyleSheet, View} from 'react-native';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  ErrorCreateAccountIcon,
  Text,
} from '@app/components/ui';
import {hideModal} from '@app/helpers/modal';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {
  LIGHT_BG_1,
  LIGHT_BG_9,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_GRAPHIC_SECOND_4,
  WINDOW_WIDTH,
} from '@app/variables';

export const ErrorCreateAccount = () => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);
  const onPress = () => {
    hideModal();
  };
  return (
    <View style={page.container}>
      <View style={page.modalView}>
        <View style={page.modalContent}>
          <Text t5 style={page.titleText}>
            Failed to create an account
          </Text>
          <Text t14 style={page.subTitleText}>
            Please try again later
          </Text>
          <ErrorCreateAccountIcon
            color={LIGHT_GRAPHIC_SECOND_4}
            style={page.icon}
            width={120}
            height={120}
          />
          <Button
            title="Close"
            onPress={onPress}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={page.button}
          />
        </View>
      </View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: LIGHT_BG_9,
    paddingBottom: 30,
  },
  titleText: {
    textAlign: 'center',
    width: 280,
  },
  subTitleText: {
    color: LIGHT_GRAPHIC_BASE_1,
    top: 5,
  },
  icon: {
    marginTop: 45,
  },
  modalContent: {
    top: 10,
    height: 382,
    width: WINDOW_WIDTH - 32,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
  },
  modalView: {
    backgroundColor: LIGHT_BG_1,
    borderRadius: 16,
    alignItems: 'center',
  },
  button: {
    width: WINDOW_WIDTH - 90,
    marginTop: 45,
    marginBottom: 20,
  },
});
