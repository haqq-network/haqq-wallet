import React, {useCallback, useEffect, useMemo} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {hideModal} from '@app/helpers';
import {useApp, useWalletsList} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';

export interface WalletsBottomSheetProps {
  title: I18N;
  visibleOnly?: boolean;
  closeDistance?: number;
  eventSuffix?: string;
  wallets?: Wallet[];
}

export function WalletsBottomSheet({
  closeDistance,
  visibleOnly,
  title,
  eventSuffix = '',
  wallets,
}: WalletsBottomSheetProps) {
  const app = useApp();
  const {visible, wallets: allWallets} = useWalletsList();

  const curWalletList = useMemo(() => {
    if (wallets) {
      return wallets;
    } else if (visibleOnly) {
      return visible;
    } else {
      return allWallets;
    }
  }, [wallets, visible, visibleOnly, allWallets]);

  const onPressWallet = useCallback(
    (address: string) => {
      hideModal();
      app.emit(`wallet-selected${eventSuffix}`, address);
    },
    [app, eventSuffix],
  );
  const onClose = () => {
    app.emit(`wallet-bottom-sheet-close${eventSuffix}`);
    hideModal();
  };

  useEffect(() => {
    if (curWalletList.length === 1) {
      onPressWallet(curWalletList[0].address);
      hideModal();
    }
  }, [curWalletList, onPressWallet]);

  return (
    <BottomSheet
      onClose={onClose}
      closeDistance={closeDistance}
      title={getText(title)}>
      {curWalletList.map((item, id) => (
        <WalletRow key={id} item={item} onPress={onPressWallet} />
      ))}
      <Spacer height={50} />
    </BottomSheet>
  );
}
