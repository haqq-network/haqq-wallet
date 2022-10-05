import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ArrowBackIcon, IconButton, Paragraph} from './ui';
import {GRAPHIC_BASE_1, TEXT_BASE_1} from '../variables';
import {StackHeaderProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const PopupHeader = ({
  options,
  back,
  navigation,
  route,
}: StackHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[page.container, options.tab && {marginTop: insets.top}]}>
      {back && !options.headerBackHidden ? (
        <IconButton
          onPress={navigation.goBack}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ArrowBackIcon color={GRAPHIC_BASE_1} />
        </IconButton>
      ) : (
        <View style={page.spacer} />
      )}
      <Paragraph h1 style={page.title}>
        {options.title}
      </Paragraph>
      {options.headerRight ? (
        options.headerRight({navigation, route})
      ) : (
        <View style={page.spacer} />
      )}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
    zIndex: 1,
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
