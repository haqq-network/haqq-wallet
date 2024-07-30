import React, {useMemo} from 'react';

import {Color} from '@app/colors';
import {Text, TextPosition, TextVariant} from '@app/components/ui/text';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {LONG_NUM_PRECISION} from '@app/variables/common';

export type NetworkFeeProps = {
  fee?: Balance | null;
};
export const NetworkFee = ({fee}: NetworkFeeProps) => {
  const value = useMemo(() => {
    if (fee === undefined) {
      return '';
    }
    if (fee === null) {
      return getText(I18N.estimatingGas);
    }

    return fee.toBalanceString(LONG_NUM_PRECISION);
  }, [fee]);

  return (
    <Text
      variant={TextVariant.t15}
      i18n={I18N.networkFee}
      i18params={{value}}
      position={TextPosition.center}
      color={Color.textBase2}
    />
  );
};
