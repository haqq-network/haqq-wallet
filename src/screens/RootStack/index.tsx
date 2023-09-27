import React, {memo, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';
import {FullWindowOverlay} from 'react-native-screens';

import {getWelcomeScreen} from '@app/helpers/get-welcome-screen';
import {HomeStack} from '@app/screens/HomeStack';
import {ModalsScreen} from '@app/screens/modals-screen';
import {WelcomeStack} from '@app/screens/WelcomeStack';

type Props = {
  onboarded: boolean;
  isPinReseted: boolean;
  isReady: boolean;
};

const RootStack = memo(({onboarded, isPinReseted, isReady}: Props) => {
  const initialRouteName = useMemo(() => {
    return getWelcomeScreen();
  }, []);

  const CurrentStack = useMemo(() => {
    if (onboarded && !isPinReseted) {
      return <HomeStack />;
    }

    return <WelcomeStack initialRouteName={initialRouteName} />;
  }, [onboarded, isPinReseted, initialRouteName]);

  return (
    <View style={styles.container}>
      {CurrentStack}
      <FullWindowOverlay>
        <ModalsScreen initialModal={!isReady ? {type: 'splash'} : undefined} />
      </FullWindowOverlay>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {flex: 1},
});

export {RootStack};
