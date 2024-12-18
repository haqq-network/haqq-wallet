import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import {Edges, SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '@app/hooks';
import {AppTheme} from '@app/types';
import {IS_ANDROID} from '@app/variables/common';

export const NetworkLoggerScreen = observer(() => {
  const edges = useMemo(() => {
    const e = ['bottom'];

    if (IS_ANDROID) {
      e.push('top');
    }

    return e as Edges;
  }, []);

  const theme = useTheme();

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      <NetworkLogger theme={theme === AppTheme.dark ? 'dark' : 'light'} />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
