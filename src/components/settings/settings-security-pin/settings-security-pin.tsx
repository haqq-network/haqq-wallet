import React, {useCallback, useRef, useState} from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {I18N, getText} from '@app/i18n';

interface SettingsSecurityPinProps {
  onPinRepeated: (pin: string, pin2: string) => Promise<boolean>;
}

export const SettingsSecurityPin = ({
  onPinRepeated,
}: SettingsSecurityPinProps) => {
  const pinRef = useRef<PinInterface>();
  const [pin, setPin] = useState('');
  const [isRepeatPin, setIsRepeatPin] = useState(false);
  const onPin = useCallback((newPin: string) => {
    setPin(newPin);
    setIsRepeatPin(true);
  }, []);

  const onPinRepeatedCb = useCallback(
    async (repeatedPin: string) => {
      onPinRepeated(pin, repeatedPin)
        .then(state => {
          if (!state) {
            pinRef.current?.reset(getText(I18N.settingsSecurityPinNotMatched));
          }
        })
        .catch(() => {
          pinRef.current?.reset(getText(I18N.settingsSecurityPinNotMatched));
        });
    },
    [onPinRepeated, pin],
  );

  return (
    <Pin
      title={
        isRepeatPin
          ? I18N.settingsSecurityPinRepeat
          : I18N.settingsSecurityPinSet
      }
      onPin={isRepeatPin ? onPinRepeatedCb : onPin}
      ref={pinRef}
      key={
        isRepeatPin
          ? getText(I18N.settingsSecurityPinEnter)
          : getText(I18N.settingsSecurityPinConfirm)
      }
    />
  );
};
