import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  BG_1,
  GRAPHIC_BASE_1,
  GRAPHIC_SECOND_13,
  GRAPHIC_SECOND_4,
} from '../../variables';
import {
  ErrorCreateAccountIcon,
  Button,
  ButtonSize,
  ButtonVariant,
  Text,
} from '../ui';
import {windowWidth} from '../../helpers';
import {app} from '../../contexts/app';

export const ErrorCreateAccount = () => {
  const onPress = () => {
    app.emit('modal', null);
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
            color={GRAPHIC_SECOND_4}
            style={page.icon}
            width={120}
            height={120}
          />
          <Button
            title="Close"
            onPress={onPress}
            variant={ButtonVariant.second}
            size={ButtonSize.large}
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
    backgroundColor: GRAPHIC_SECOND_13,
    paddingBottom: 30,
  },
  titleText: {
    textAlign: 'center',
    width: 280,
  },
  subTitleText: {
    color: GRAPHIC_BASE_1,
    top: 5,
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
    backgroundColor: BG_1,
    borderRadius: 16,
    alignItems: 'center',
  },
  button: {
    width: windowWidth - 90,
    marginTop: 45,
    marginBottom: 20,
  },
});
