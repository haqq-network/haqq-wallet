import React from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {ProviderModel} from '@app/models/provider';

import {SettingsProvidersRow} from './settings-providers-row';

export type SettingsProvidersProps = {
  providers: ProviderModel[];
  providerId: string;
  onSelect: (providerId: string) => void;
};

export const SettingsProviders = ({
  providers,
  providerId,
  onSelect,
}: SettingsProvidersProps) => {
  return (
    <FlatList
      key={providerId}
      data={providers}
      renderItem={({item}) => (
        <SettingsProvidersRow
          item={item}
          onPress={onSelect}
          providerId={providerId}
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
