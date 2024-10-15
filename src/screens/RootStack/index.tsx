import React, {memo} from 'react';

import {StyleSheet, View} from 'react-native';

import {ModalProvider} from '@app/components/modal-provider';
import {HomeStack} from '@app/screens/HomeStack';
import {ModalsScreen} from '@app/screens/modals-screen';
import {WelcomeStack} from '@app/screens/WelcomeStack';

type Props = {
  onboarded: boolean;
  isPinReseted: boolean;
  isReady: boolean;
};

const RootStack = memo(({onboarded, isPinReseted, isReady}: Props) => {
  return (
    <View style={styles.container}>
      {onboarded && !isPinReseted ? <HomeStack /> : <WelcomeStack />}
      <ModalProvider>
        <ModalsScreen initialModal={!isReady ? {type: 'splash'} : undefined} />
      </ModalProvider>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {flex: 1},
});

export {RootStack};
