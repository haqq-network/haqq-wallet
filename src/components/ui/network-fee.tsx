import React from 'react';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {I18N} from '@app/i18n';
import {cleanNumber} from '@app/utils';

export type NetworkFeeProps = {
  fee: number | string;
  currency?: string;
};
export const NetworkFee = ({fee, currency = 'aISLM'}: NetworkFeeProps) => {
  return (
    <Text
      t15
      i18n={I18N.networkFee}
      i18params={{fee: cleanNumber(fee), currency: currency}}
      center
      color={Color.textBase2}
    />
  );
};
