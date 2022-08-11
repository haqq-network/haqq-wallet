import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon, IconButton} from './ui';
import {NativeStackHeaderProps} from '@react-navigation/native-stack';

export const Header = ({
  options,
  back,
  navigation,
  ...params
}: NativeStackHeaderProps) => {
  return (
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
      <View style={page.spacer} />
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
  },
  title: {
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: '#2F2F2F',
  },
  spacer: {
    width: 24,
    height: 24,
  },
});
