import React from 'react';
import {StyleSheet, View} from 'react-native';
import {LIGHT_BG_1, LIGHT_BG_9, LIGHT_GRAPHIC_SECOND_4} from '../../variables';
import {AccountAddedIcon, Button, ButtonSize, ButtonVariant, Text} from '../ui';

import {windowWidth} from '../../helpers';
import {hideModal} from '../../helpers/modal';

export const ErrorAccountAdded = () => {
  const onPress = () => {
    hideModal();
  };
  return (
    <View style={page.container}>
      <View style={page.modalView}>
        <View style={page.modalContent}>
          <Text t5 style={page.titleText}>
            This account has already been added
          </Text>
          <AccountAddedIcon
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
  icon: {
    marginTop: 45,
  },
  modalContent: {
    top: 10,
    height: 382,
    width: windowWidth - 32,
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
    width: windowWidth - 90,
    marginTop: 45,
    marginBottom: 20,
  },
});
