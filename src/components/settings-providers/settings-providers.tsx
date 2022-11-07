import React from 'react';

import {FlatList} from 'react-native';

import {SettingsProvidersRow} from './settings-providers-row';

import {createTheme} from '../../helpers/create-theme';
import {Provider} from '../../models/provider';

export type SettingsProvidersProps = {
  providers: Provider[];
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

const styles = createTheme({
  container: {
    flex: 1,
  },
});
