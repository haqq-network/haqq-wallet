import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {ArrowBackIcon, IconButton, Paragraph, ParagraphSize} from './ui';
import {GRAPHIC_BASE_1, TEXT_BASE_1} from '../variables';
import {StackHeaderProps} from '@react-navigation/stack';

export const PopupHeader = ({
  options,
  back,
  navigation,
  route,
}: StackHeaderProps) => {
  return (
    <SafeAreaView>
      <View style={page.container}>
        {back ? (
          <IconButton
            onPress={navigation.goBack}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <ArrowBackIcon color={GRAPHIC_BASE_1} />
          </IconButton>
        ) : (
          <View style={page.spacer} />
        )}
        <Paragraph size={ParagraphSize.l} style={page.title}>
          {options.title}
        </Paragraph>
        {options.headerRight ? (
          options.headerRight(route.params)
        ) : (
          <View style={page.spacer} />
        )}
      </View>
    </SafeAreaView>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
  spacer: {
    width: 24,
    height: 24,
  },
});
