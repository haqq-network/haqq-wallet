import React from 'react';

import {StyleSheet, View} from 'react-native';

import {DataContent, MenuNavigationButton} from './ui';

export const SettingsSocialLogins = () => {
  return (
    <View style={styles.container}>
      <MenuNavigationButton onPress={() => {}} hideArrow checked>
        <DataContent title={'Google'} subtitle={'test@haqq'} />
      </MenuNavigationButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
});
