import {memo, useMemo} from 'react';

import {View} from 'react-native';

import {getAppVersion, getBuildNumber} from '@app/services/version';
import {Color, createTheme} from '@app/theme';
import {STRINGS} from '@app/variables/common';

import {Text} from './ui';

export const AppVersionAbsoluteView = memo(() => {
  const version = useMemo(
    () =>
      `v${STRINGS.NBSP}${getAppVersion()}${STRINGS.NBSP}(${getBuildNumber()})`,
    [],
  );
  return (
    <View style={styles.container}>
      <Text clean style={styles.text}>
        {version}
      </Text>
    </View>
  );
});

const styles = createTheme({
  container: {
    position: 'absolute',
    bottom: 2,
    left: 2,
  },
  text: {
    fontSize: 8,
    lineHeight: 10,
    color: Color.textBase2,
  },
});
