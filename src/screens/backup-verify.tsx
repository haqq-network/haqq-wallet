import React, {useCallback, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {BackupVerify} from '@app/components/backup-verify';
import {useWallets} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {RootStackParamList} from '@app/types';

export const BackupVerifyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {mnemonic, rootAddress} =
    useRoute<RouteProp<RootStackParamList, 'backupVerify'>>().params;

  const wallets = useWallets();
  const [error, setError] = useState<number | null>(null);

  const onDone = useCallback(
    (selected: string) => {
      if (selected === mnemonic) {
        const walletList = wallets.getForRootAddress(rootAddress);
        for (const wallet of walletList) {
          wallet.mnemonicSaved = true;
        }

        navigation.navigate('backupFinish');
      } else {
        vibrate(HapticEffects.error);
        setError(Math.random);
      }

      navigation.navigate('backupFinish');
    },
    [navigation, mnemonic, rootAddress, wallets],
  );

  return (
    <BackupVerify
      error={Boolean(error)}
      phrase={mnemonic}
      onDone={onDone}
      key={error}
    />
  );
};
