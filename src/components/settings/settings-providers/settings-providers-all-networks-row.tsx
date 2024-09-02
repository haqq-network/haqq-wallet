import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, IconsName, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AllNetworksProvider} from '@app/models/provider';

export type SettingsProvidersAllNetworksRowProps = {
  item: AllNetworksProvider;
  providerId: string;
  onPress: (providerId: string) => void;
};
export const SettingsProvidersAllNetworksRow = ({
  item,
  onPress,
  providerId,
}: SettingsProvidersAllNetworksRowProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.id);
      }}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon
            name={IconsName.networks}
            color={Color.textBase1}
            style={styles.icon}
          />
        </View>
        <Spacer width={12} />
        <DataContent style={styles.info} title={item.name} />
        <Spacer flex={1} />
        {providerId === 'all_networks' && (
          <Icon color={Color.graphicGreen1} name="check" i24 />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {justifyContent: 'space-between'},
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  icon: {width: 28, height: 28},
});
