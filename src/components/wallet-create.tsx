import React from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/core';
import {Button, ButtonSize, ButtonVariant, Spacer, Text} from './ui';
import {
  BG_1,
  GRAPHIC_GREEN_1,
  GRAPHIC_SECOND_1,
  GRAPHIC_SECOND_7,
  MAGIC_CARD_HEIGHT,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../variables';
import {RootStackParamList} from '../types';
import {IS_LEDGER_ENABLED} from '@env';

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

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    width: cardWidth,
    height: Math.max(cardWidth * MAGIC_CARD_HEIGHT, 212),
    borderColor: GRAPHIC_SECOND_1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: BG_1,
    shadowColor: GRAPHIC_SECOND_7,
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
    color: TEXT_GREEN_1,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: TEXT_BASE_2,
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
  ledgerIcon: {width: 22, height: 22, tintColor: GRAPHIC_GREEN_1},
});
