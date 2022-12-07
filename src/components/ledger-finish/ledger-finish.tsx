import React, {useEffect} from 'react';

import {HapticEffects, vibrate} from '@app/services/haptic';

import {I18N} from '@app/i18n';
import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers/modal';

interface LedgerFinishProps {
    onEnd: () => void
}

export const LedgerFinish = ({onEnd}: LedgerFinishProps) => {
  useEffect(() => {
    hideModal();
    vibrate(HapticEffects.success);
  }, []);

  return (
    <Finish
      i18n={I18N.ledgerFinishCongratulations}
      onFinish={onEnd}
      testID="ledger_finish"
    />
  );
};
