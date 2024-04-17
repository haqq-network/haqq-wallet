import React from 'react';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant, TrimmedText} from '@app/components/ui';
import {I18N} from '@app/i18n';

type Props = {
  description: string;
};

export const NftItemDetailsDescription = ({description}: Props) => {
  return (
    <>
      <Text variant={TextVariant.t12} i18n={I18N.nftDetailsDescription} />
      <Spacer height={8} />
      <TrimmedText
        limit={100}
        variant={TextVariant.t14}
        color={Color.textBase2}>
        {description}
      </TrimmedText>
      <Spacer height={20} />
    </>
  );
};
