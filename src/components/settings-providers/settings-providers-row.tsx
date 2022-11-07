import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color, getColor} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {Provider} from '../../models/provider';
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
          subtitle={`${item.name} (${item.chainId})`}
        />
        {providerId === item.id && (
          <CheckIcon
            color={getColor(Color.graphicGreen1)}
            style={styles.icon}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
