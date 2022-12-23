import React, {useCallback, useRef} from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {app} from '@app/contexts';
import {captureException, hideModal, showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

interface SettingsSecurityPinMnemonicProps {
  onSuccess: () => Promise<void>;
}

export const SettingsSecurityPinMnemonic = ({
  onSuccess,
}: SettingsSecurityPinMnemonicProps) => {
  const pinRef = useRef<PinInterface>();

  const onPin = useCallback(
    async (pin: string) => {
      showModal('loading');
      try {
        await app.comparePin(pin);
        await onSuccess();
        pinRef.current?.reset();
      } catch (error) {
        pinRef.current?.reset(getText(I18N.settingsSecurityPinNotMatched));
        captureException(error, 'settings-security-pin-mnemonic');
      }
      hideModal();
    },
    [onSuccess],
  );

  return (
    <Pin title={I18N.settingsSecurityWalletPin} onPin={onPin} ref={pinRef} />
  );
};
