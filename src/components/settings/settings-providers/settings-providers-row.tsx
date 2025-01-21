import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {ImageWrapper} from '@app/components/image-wrapper';
import {DataContent, Icon, Spacer} from '@app/components/ui';
import {ALL_NETWORKS_ID, ProviderModel} from '@app/models/provider';
import {ChainId} from '@app/types';

import {SettingsProvidersAllNetworksRow} from './settings-providers-all-networks-row';

export type SettingsProvidersRowProps = {
  item: ProviderModel;
  providerChainId: ChainId;
  onPress: (providerChainId: ChainId) => void;
};
export const SettingsProvidersRow = ({
  item,
  onPress,
  providerChainId,
}: SettingsProvidersRowProps) => {
  if (item.id === ALL_NETWORKS_ID) {
    return (
      <SettingsProvidersAllNetworksRow
        item={item}
        providerChainId={providerChainId}
        onPress={onPress}
      />
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.ethChainId);
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
        {providerChainId === item.ethChainId && (
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
