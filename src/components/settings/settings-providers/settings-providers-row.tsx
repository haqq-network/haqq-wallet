import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {DataContent, Icon} from '@app/components/ui';
import {Provider} from '@app/models/provider';
import {Color} from '@app/theme';

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
          <Icon color={Color.graphicGreen1} name="check" i24 />
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
});
