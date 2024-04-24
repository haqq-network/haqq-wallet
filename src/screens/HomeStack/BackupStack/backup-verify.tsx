import React, {memo, useCallback, useRef, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native/src';

import {BackupVerify} from '@app/components/backup-verify';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getProviderInstanceForWallet} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {Wallet} from '@app/models/wallet';
import {BackupStackParamList, BackupStackRoutes} from '@app/route-types';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const BackupVerifyScreen = memo(() => {
  const navigation = useTypedNavigation<BackupStackParamList>();
  const {wallet} = useTypedRoute<
    BackupStackParamList,
    BackupStackRoutes.BackupVerify
  >().params;
  const provider = useRef<
    ProviderMnemonicReactNative | ProviderSSSReactNative | null
  >(null);

  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffectAsync(async () => {
    provider.current = (await getProviderInstanceForWallet(
      wallet,
      true,
      true,
    )) as ProviderMnemonicReactNative | ProviderSSSReactNative;

    if (
      provider.current instanceof ProviderMnemonicReactNative ||
      provider.current instanceof ProviderSSSReactNative
    ) {
      provider.current.getMnemonicPhrase().then(phrase => setMnemonic(phrase));
    }
  }, [wallet, provider]);

  const [error, setError] = useState<number | null>(null);

  const onDone = useCallback(
    async (selected: string) => {
      if (selected === mnemonic && provider.current !== null) {
        if (provider.current instanceof ProviderMnemonicReactNative) {
          await provider.current.setMnemonicSaved();
        }

        const accountId = wallet.accountId;
        if (accountId) {
          Wallet.getForAccount(accountId).map(item => {
            Wallet.update(item.address, {mnemonicSaved: true});
          });
        }

        app.emit(
          Events.onWalletMnemonicSaved,
          provider.current.getIdentifier(),
        );
        navigation.navigate(BackupStackRoutes.BackupFinish);
      } else {
        vibrate(HapticEffects.error);
        setError(Math.random);
      }
    },
    [provider, navigation, mnemonic],
  );

  if (!mnemonic) {
    return <Loading />;
  }

  return (
    <BackupVerify
      error={!!error}
      phrase={mnemonic}
      onDone={onDone}
      key={error}
      testID="backup_verify"
    />
  );
});
