import React, {useMemo} from 'react';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

export type NetworkFeeProps = {
  fee: Balance;
  currency?: 'aISLM' | 'ISLM';
};
export const NetworkFee = ({fee, currency = 'aISLM'}: NetworkFeeProps) => {
  const value = useMemo(() => {
    if (currency === 'aISLM') {
      return fee.toWeiString();
    }
    return fee.toEtherString();
  }, [fee, currency]);

  return (
    <Text
      t15
      i18n={I18N.networkFee}
      i18params={{value}}
      center
      color={Color.textBase2}
    />
  );
};
