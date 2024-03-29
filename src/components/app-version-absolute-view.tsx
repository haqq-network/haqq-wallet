import {memo, useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {getAppVersion, getBuildNumber} from '@app/services/version';

import {ModalProvider} from './modal-provider';
import {Text} from './ui';

export const AppVersionAbsoluteView = memo(() => {
  const version = useMemo(() => getAppVersion(), []);
  const build = useMemo(() => getBuildNumber(), []);
  return (
    <ModalProvider>
      <View style={styles.container}>
        <Text clean style={styles.text}>
          {version}
        </Text>
        <Text clean style={styles.text}>
          {build}
        </Text>
      </View>
    </ModalProvider>
  );
});

const styles = createTheme({
  container: {
    position: 'absolute',
    zIndex: 999,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    bottom: 2,
    paddingHorizontal: 2,
  },
  text: {
    fontSize: 8,
    lineHeight: 10,
    color: Color.textBase2,
  },
});
