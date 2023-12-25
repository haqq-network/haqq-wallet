import React, {useCallback, useEffect} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {app} from '@app/contexts';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {ModalType, Modals} from '@app/types';

export function WalletsBottomSheet({
  closeDistance,
  wallets,
  title,
  autoSelectWallet = true,
  initialAddress,
  errorEventName,
  successEventName,
  onClose,
}: Modals[ModalType.walletsBottomSheet]) {
  const closeDistanceCalculated = useCalculatedDimensionsValue(
    () => closeDistance?.(),
    [closeDistance],
  );
  const onPressWallet = useCallback(
    (address: string) => {
      onClose?.();
      app.emit(successEventName, address);
    },
    [successEventName, onClose],
  );
  const onCloseSheet = () => {
    app.emit(errorEventName);
    onClose?.();
  };

  useEffect(() => {
    if (autoSelectWallet && wallets.length === 1) {
      onPressWallet(wallets[0].address);
      onClose?.();
    }

    return () => {
      app.emit(errorEventName);
    };
  }, [wallets, onPressWallet, errorEventName, autoSelectWallet, onClose]);

  return (
    <BottomSheet
      onClose={onCloseSheet}
      closeDistance={closeDistanceCalculated}
      i18nTitle={title}>
      {wallets.map((item, id) => {
        const checked =
          !!initialAddress &&
          String(initialAddress).toLocaleLowerCase() ===
            item.address.toLowerCase();

        return (
          <WalletRow
            key={id}
            item={item}
            onPress={onPressWallet}
            type={WalletRowTypes.variant5}
            hideArrow
            checked={checked}
          />
        );
      })}
      <Spacer height={50} />
    </BottomSheet>
  );
}
