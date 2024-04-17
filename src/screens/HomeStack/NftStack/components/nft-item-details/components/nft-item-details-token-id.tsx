import React from 'react';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {I18N} from '@app/i18n';

type Props = {
  tokenId: number;
};

export const NftItemDetailsTokenId = ({tokenId}: Props) => {
  return (
    <>
      <Text variant={TextVariant.t12} i18n={I18N.nftDetailsTokenId} />
      <Spacer height={8} />
      <Text variant={TextVariant.t14} color={Color.textBase1}>
        {tokenId}
      </Text>
      <Spacer height={20} />
    </>
  );
};
