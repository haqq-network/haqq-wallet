import React, {useEffect, useState} from 'react';

import {when} from 'mobx';
import {observer} from 'mobx-react';
import {StyleSheet, View} from 'react-native';

import {ModalProvider} from '@app/components/modal-provider';
import {AppStore} from '@app/models/app';
import {Wallet} from '@app/models/wallet';
import {HomeStack} from '@app/screens/HomeStack';
import {ModalsScreen} from '@app/screens/modals-screen';
import {WelcomeStack} from '@app/screens/WelcomeStack';

type Props = {
  isPinReseted: boolean;
};

const RootStack = observer(({isPinReseted}: Props) => {
  const [hasWallets, setHasWallets] = useState(false);
  const showHomeStack = (hasWallets || AppStore.isOnboarded) && !isPinReseted;

  useEffect(() => {
    when(() => Wallet.isHydrated).then(() => {
      setHasWallets(Wallet.getAll().length > 0);
    });
  }, []);

  return (
    <View accessible={false} style={styles.container}>
      {showHomeStack ? <HomeStack /> : <WelcomeStack />}
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
