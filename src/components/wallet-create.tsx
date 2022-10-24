import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/core';
import {Button, ButtonVariant, Text} from './ui';
import {
  BG_1,
  GRAPHIC_SECOND_1,
  GRAPHIC_SECOND_7,
  MAGIC_CARD_HEIGHT,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../variables';
import {RootStackParamList} from '../types';
import {IS_LEDGER_ENABLED} from '@env';

const isLedgerEnabled = Boolean(parseInt(IS_LEDGER_ENABLED));

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
      <Button
        variant={ButtonVariant.contained}
        title="Create new"
        onPress={() => {
          navigation.navigate('create');
        }}
        style={page.create}
      />
      <View style={page.buttons}>
        {isLedgerEnabled && (
          <Button
            variant={ButtonVariant.second}
            title="Connect"
            style={page.create}
            onPress={() => {
              navigation.navigate('ledger');
            }}
          />
        )}
        <Button
          title="Import  an existing one"
          style={page.create}
          onPress={() => {
            navigation.navigate('restore');
          }}
        />
      </View>
    </View>
  );
};

const cardWidth = Dimensions.get('window').width - 40;

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 40,
    height: cardWidth * MAGIC_CARD_HEIGHT,
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
    shadowRadius: 16,
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
    marginBottom: 18,
    color: TEXT_BASE_2,
  },
  create: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    lineHeight: 22,
  },
  buttons: {
    alignSelf: 'center',
    marginTop: 4,
    flexDirection: 'row',
  },
});
