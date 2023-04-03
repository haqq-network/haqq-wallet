import React, {useCallback, useEffect} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {hideModal} from '@app/helpers';
import {useApp} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';

export interface WalletsBottomSheetProps {
  wallets: Wallet[];
  closeDistance?: number;
  title: I18N;
  eventSuffix?: string;
}

export function WalletsBottomSheet({
  closeDistance,
  wallets,
  title,
  eventSuffix = '',
}: WalletsBottomSheetProps) {
  const app = useApp();

  const onPressWallet = useCallback(
    (address: string) => {
      hideModal();
      app.emit(`wallet-selected${eventSuffix}`, address);
    },
    [app, eventSuffix],
  );
  const onClose = () => {
    app.emit(`wallet-selected-reject${eventSuffix}`);
    hideModal();
  };

  useEffect(() => {
    if (wallets.length === 1) {
      onPressWallet(wallets[0].address);
      hideModal();
    }

    return () => {
      app.emit(`wallet-selected-reject${eventSuffix}`);
    };
  }, [wallets, onPressWallet, app, eventSuffix]);

  return (
    <BottomSheet
      onClose={onClose}
      closeDistance={closeDistance}
      i18nTitle={title}>
      {wallets.map((item, id) => (
        <WalletRow key={id} item={item} onPress={onPressWallet} />
      ))}
      <Spacer height={50} />
    </BottomSheet>
  );
}
