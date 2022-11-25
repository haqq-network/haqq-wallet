import React from 'react';

import {NavigationProp} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/native';
import {Dimensions, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {Button, ButtonSize, ButtonVariant, Spacer, Text} from './ui';

import {RootStackParamList} from '../types';
import {
  LIGHT_BG_1,
  LIGHT_GRAPHIC_SECOND_1,
  LIGHT_TEXT_GREEN_1,
  MAGIC_CARD_HEIGHT,
  SHADOW_COLOR,
} from '../variables';

export type BalanceProps = {};
export const WalletCreate = ({}: BalanceProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={page.container}>
      <Text t8 style={page.title}>
        Add accounts
      </Text>
      <Text t14 center color={Color.textBase2}>
        Import and create new accounts
      </Text>
      <Spacer />
      <Button
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        title="Create new"
        onPress={() => {
          navigation.navigate('create');
        }}
        style={page.create}
      />
      <View style={page.buttons}>
        <Button
          variant={ButtonVariant.second}
          size={ButtonSize.middle}
          title="Connect"
          style={page.createSmall}
          iconRight="ledger"
          iconRightColor={Color.graphicGreen1}
          onPress={() => {
            navigation.navigate('ledger');
          }}
        />
        <Button
          size={ButtonSize.middle}
          title="Import"
          style={page.createSmall}
          onPress={() => {
            navigation.navigate('restore');
          }}
        />
      </View>
    </View>
  );
};

const cardWidth = Dimensions.get('window').width - 40;

const page = createTheme({
  container: {
    justifyContent: 'space-between',
    width: cardWidth,
    height: Math.max(cardWidth * MAGIC_CARD_HEIGHT, 212),
    borderColor: LIGHT_GRAPHIC_SECOND_1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: LIGHT_BG_1,
    shadowColor: SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
  },
  title: {
    fontWeight: '600',
    color: LIGHT_TEXT_GREEN_1,
    textAlign: 'center',
    marginBottom: 4,
  },
  create: {
    flex: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
    lineHeight: 22,
    marginBottom: 8,
  },
  createSmall: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    lineHeight: 22,
  },
  buttons: {
    alignSelf: 'center',
    flexDirection: 'row',
  },
});
