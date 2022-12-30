import React, {useRef} from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';

import {CustomHeader} from '../ui';

interface PinGuardProps {
  onPin: (pin: string) => void;
  pinRef: React.MutableRefObject<PinInterface | undefined>;
}

export const PinGuard = ({onPin}: PinGuardProps) => {
  const pinRef = useRef<PinInterface>();
  const {goBack} = useTypedNavigation();

  return (
    <>
      <CustomHeader
        onPressLeft={goBack}
        iconLeft="arrow_back"
        title={I18N.settingsSecurity}
      />
      <Pin title={I18N.settingsSecurityWalletPin} onPin={onPin} ref={pinRef} />
    </>
  );
};
