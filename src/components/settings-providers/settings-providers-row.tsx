import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {Provider} from '../../models/provider';
import {LIGHT_GRAPHIC_GREEN_1} from '../../variables';
import {CheckIcon, DataContent} from '../ui';

export type SettingsProvidersRowProps = {
  item: Provider;
  providerId: string;
  onPress: (providerId: string) => void;
};
export const SettingsProvidersRow = ({
  item,
  onPress,
  providerId,
}: SettingsProvidersRowProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.id);
      }}>
      <View style={styles.container}>
        <DataContent
          style={styles.info}
          title={item.name}
          subtitle={`${item.name} (${item.ethChainId})`}
        />
        {providerId === item.id && (
          <CheckIcon color={LIGHT_GRAPHIC_GREEN_1} style={styles.icon} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  info: {justifyContent: 'space-between'},
  icon: {
    width: 24,
    height: 24,
  },
});
