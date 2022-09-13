import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Icon, IconButton} from './ui';
import {TEXT_BASE_1} from '../variables';
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
            <Icon name={'arrow-back'} />
          </IconButton>
        ) : (
          <View style={page.spacer} />
        )}
        <Text style={page.title}>{options.title}</Text>
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
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
  spacer: {
    width: 24,
    height: 24,
  },
});
