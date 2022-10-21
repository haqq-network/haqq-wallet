import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {Provider} from '../../models/provider';
import {CheckIcon, DataContent} from '../ui';
import {GRAPHIC_GREEN_1} from '../../variables';

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
          subtitle={`${item.name} (${item.chainId})`}
        />
        {providerId === item.id && (
          <CheckIcon color={GRAPHIC_GREEN_1} style={styles.icon} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  info: {justifyContent: 'space-between'},
  icon: {
    width: 24,
    height: 24,
  },
});
