import React, {useEffect} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ModalType, Modals} from '@app/types';

export function CopyAddressBottomSheet({
  wallet,
  eventSuffix = '',
  onClose,
}: Modals[ModalType.copyAddressBottomSheet]) {
  const onCloseModal = () => {
    app.emit(`provider-selected-reject${eventSuffix}`);
    onClose?.();
  };

  useEffect(() => {
    return () => {
      app.emit(`copy-address-reject${eventSuffix}`);
    };
  }, [eventSuffix]);

  return (
    <BottomSheet
      onClose={onCloseModal}
      contentContainerStyle={styles.container}
      i18nTitle={I18N.evmTitle}>
      {/* HAQQ */}
      <Text>{wallet.address}</Text>
      {/* ETH */}
      <Text>{wallet.address}</Text>
      {/* TRON */}
      {Boolean(wallet.tronAddress) && <Text>{wallet.tronAddress}</Text>}
      <Spacer height={50} />
    </BottomSheet>
  );
}

const styles = createTheme({
  container: {
    height: '100%',
  },
});
