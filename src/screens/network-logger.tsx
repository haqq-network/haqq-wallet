import React, {useCallback, useMemo} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';
import {Alert, StyleSheet} from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import {Edges, SafeAreaView} from 'react-native-safe-area-context';

import {First, Loading} from '@app/components/ui';
import {useTheme} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {navigator} from '@app/navigator';
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

  useFocusEffect(
    useCallback(() => {
      if (__DEV__ && !AppStore.networkLoggerEnabled) {
        Alert.alert('Enable Network Logger?', '', [
          {
            text: 'Go back',
            onPress: () => {
              navigator.goBack();
              AppStore.networkLoggerEnabled = false;
            },
          },
          {
            text: 'Enable',
            style: 'destructive',
            onPress: () => {
              AppStore.networkLoggerEnabled = true;
            },
          },
        ]);
      }
    }, [navigator]),
  );

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      <First>
        {AppStore.networkLoggerEnabled && (
          <NetworkLogger theme={theme === AppTheme.dark ? 'dark' : 'light'} />
        )}
        <Loading />
      </First>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
