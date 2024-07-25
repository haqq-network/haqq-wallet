import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {ImageWrapper} from '@app/components/image-wrapper';
import {DataContent, Icon, Spacer} from '@app/components/ui';
import {Provider} from '@app/models/provider';

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
        <ImageWrapper source={item.icon} style={styles.icon} />
        <Spacer width={12} />
        <DataContent
          style={styles.info}
          title={item.name}
          subtitle={`${item.name} (${item.ethChainId})`}
        />
        <Spacer flex={1} />
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
    alignItems: 'center',
  },
  info: {justifyContent: 'space-between'},
  icon: {width: 42, height: 42},
});
