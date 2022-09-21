import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/core';
import {
  Button,
  ButtonVariant,
  Paragraph,
  ParagraphFont,
  ParagraphSize,
} from './ui';
import {
  BG_1,
  GRAPHIC_SECOND_1,
  MAGIC_CARD_HEIGHT,
  TEXT_GREEN_1,
} from '../variables';
import {RootStackParamList} from '../types';

export type BalanceProps = {};
export const WalletCreate = ({}: BalanceProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={page.container}>
      <Paragraph
        style={page.title}
        size={ParagraphSize.l}
        font={ParagraphFont.text}>
        Add accounts
      </Paragraph>
      <Paragraph style={page.subtitle}>
        Import and create new accounts
      </Paragraph>
      <Button
        variant={ButtonVariant.contained}
        title="Create new"
        onPress={() => {
          navigation.navigate('create');
        }}
        style={page.create}
      />
      <Button
        title="Import an existing one"
        style={page.create}
        onPress={() => {
          navigation.navigate('restore');
        }}
      />
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
    shadowColor: 'rgba(25, 26, 28, 0.08)',
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
  },
  create: {
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
});
