import React from 'react';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

type Props = {
  price?: Balance;
};

export const NftItemDetailsPrice = ({price}: Props) => {
  return (
    <>
      <Text variant={TextVariant.t12} i18n={I18N.nftDetailsLastSalePrice} />
      <Spacer height={8} />
      <Text variant={TextVariant.t14} color={Color.textBase1}>
        {(price || Balance.getEmpty())?.toBalanceString()}
      </Text>
      <Spacer height={20} />
    </>
  );
};
