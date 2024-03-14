import React, {memo, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {ModalProvider} from '@app/components/modal-provider';
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

  const WrappedModals = useMemo(() => {
    const Modals = ModalsScreen;
    return <Modals initialModal={!isReady ? {type: 'splash'} : undefined} />;
  }, [isReady]);

  return (
    <View style={styles.container}>
      {CurrentStack}
      <ModalProvider>{WrappedModals}</ModalProvider>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {flex: 1},
});

export {RootStack};
