import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Button, ButtonVariant, Paragraph, ParagraphSize} from './ui';
import {GRAPHIC_SECOND_1, MAGIC_CARD_HEIGHT, TEXT_GREEN_1} from '../variables';

export type BalanceProps = {};
export const WalletCreate = ({}: BalanceProps) => {
  return (
    <View style={page.container}>
      <Paragraph style={page.title} size={ParagraphSize.l}>
        Add accounts
      </Paragraph>
      <Paragraph style={page.subtitle}>
        Import and create new accounts
      </Paragraph>
      <Button
        variant={ButtonVariant.contained}
        title="Create new"
        onPress={() => {}}
        style={page.create}
      />
      <Button title="Import an existing one" onPress={() => {}} />
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
    paddingHorizontal: 20,
    paddingVertical: 28,
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
  },
});
