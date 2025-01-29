import React from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {ProviderModel} from '@app/models/provider';
import {ChainId} from '@app/types';

import {SettingsProvidersRow} from './settings-providers-row';

export type SettingsProvidersProps = {
  providers: ProviderModel[];
  providerChainId: ChainId;
  onSelect: (providerChainId: ChainId) => void;
};

export const SettingsProviders = ({
  providers,
  providerChainId,
  onSelect,
}: SettingsProvidersProps) => {
  return (
    <FlatList
      key={providerChainId}
      data={providers}
      renderItem={({item}) => (
        <SettingsProvidersRow
          item={item}
          onPress={onSelect}
          providerChainId={providerChainId}
        />
      )}
      keyExtractor={item => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
