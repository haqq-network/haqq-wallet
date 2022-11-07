import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '../../colors';
import {windowWidth} from '../../helpers';
import {createTheme} from '../../helpers/create-theme';
import {hideModal} from '../../helpers/modal';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  ErrorCreateAccountIcon,
  Text,
} from '../ui';

export const ErrorCreateAccount = () => {
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
            color={getColor(Color.graphicSecond4)}
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

const page = createTheme({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: Color.bg9,
    paddingBottom: 30,
  },
  titleText: {
    textAlign: 'center',
    width: 280,
  },
  subTitleText: {
    color: Color.graphicBase1,
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
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
  },
  button: {
    width: windowWidth - 90,
    marginTop: 45,
    marginBottom: 20,
  },
});
