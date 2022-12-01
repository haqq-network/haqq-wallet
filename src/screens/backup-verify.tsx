import React, {useCallback, useState} from 'react';

import {BackupVerify} from '@app/components/backup-verify';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const BackupVerifyScreen = () => {
  const navigation = useTypedNavigation();
  const {mnemonic, rootAddress} = useTypedRoute<'backupVerify'>().params;

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
    },
    [navigation, mnemonic, rootAddress, wallets],
  );

  return (
    <BackupVerify
      error={!!error}
      phrase={mnemonic}
      onDone={onDone}
      key={error}
    />
  );
};
