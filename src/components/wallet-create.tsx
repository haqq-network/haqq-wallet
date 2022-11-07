import React from 'react';

import {IS_LEDGER_ENABLED} from '@env';
import {NavigationProp} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/native';
import {Dimensions, Image, View} from 'react-native';

import {Button, ButtonSize, ButtonVariant, Spacer, Text} from './ui';

import {Color} from '../colors';
import {createTheme} from '../helpers/create-theme';
import {RootStackParamList} from '../types';
import {MAGIC_CARD_HEIGHT} from '../variables';

const isLedgerEnabled = Boolean(parseInt(IS_LEDGER_ENABLED, 10));

export type BalanceProps = {};
export const WalletCreate = ({}: BalanceProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={page.container}>
      <Text t8 style={page.title}>
        Add accounts
      </Text>
      <Text t14 style={page.subtitle}>
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
        {isLedgerEnabled ? (
          <>
            <Button
              variant={ButtonVariant.second}
              size={ButtonSize.middle}
              title="Connect"
              style={page.createSmall}
              iconRight={
                <Image source={{uri: 'ledger'}} style={page.ledgerIcon} />
              }
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
          </>
        ) : (
          <Button
            title="Import  an existing one"
            style={page.import}
            onPress={() => {
              navigation.navigate('restore');
            }}
          />
        )}
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
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
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
    color: Color.textGreen1,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: Color.textBase2,
  },
  create: {
    flex: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
    lineHeight: 22,
    marginBottom: 8,
  },
  import: {
    flex: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
    lineHeight: 22,
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
  ledgerIcon: {width: 22, height: 22, tintColor: Color.graphicGreen1},
});
