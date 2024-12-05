import React from 'react';

import {observer} from 'mobx-react';
import {StyleSheet, View} from 'react-native';

import {ModalProvider} from '@app/components/modal-provider';
import {AppStore} from '@app/models/app';
import {HomeStack} from '@app/screens/HomeStack';
import {ModalsScreen} from '@app/screens/modals-screen';
import {WelcomeStack} from '@app/screens/WelcomeStack';

type Props = {
  isPinReseted: boolean;
};

const RootStack = observer(({isPinReseted}: Props) => {
  return (
    <View style={styles.container}>
      {AppStore.isOnboarded && !isPinReseted ? <HomeStack /> : <WelcomeStack />}
      <ModalProvider>
        <ModalsScreen
          initialModal={!AppStore.isInitialized ? {type: 'splash'} : undefined}
        />
      </ModalProvider>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {flex: 1},
});

export {RootStack};
