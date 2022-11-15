import React, {useCallback, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {BackupVerify} from '@app/components/backup-verify/backup-verify';
import {useWallets} from '@app/hooks';
import {RootStackParamList} from '@app/types';

export const BackupVerifyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'backupVerify'>>();

  const wallets = useWallets();
  const [error, setError] = useState<number | null>(null);

  const onDone = useCallback(
    (selected: string) => {
      if (selected === route.params.mnemonic) {
        const walletList = wallets.getForRootAddress(route.params.rootAddress);
        for (const wallet of walletList) {
          wallet.mnemonicSaved = true;
        }

        navigation.navigate('backupFinish');
      } else {
        setError(Math.random);
      }
    },
    [route.params.mnemonic, route.params.rootAddress, wallets, navigation],
  );

  return (
    <BackupVerify
      error={Boolean(error)}
      phrase={route.params.mnemonic}
      onDone={onDone}
      key={error}
    />
  );
};
