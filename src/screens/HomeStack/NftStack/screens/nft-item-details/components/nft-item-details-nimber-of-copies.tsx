import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {I18N} from '@app/i18n';

type Props = {
  amount: number;
};

export const NftItemDetailsNumberOfCopies = ({amount}: Props) => {
  return (
    <View>
      <Text variant={TextVariant.t12} i18n={I18N.nftDetailsNumberOfCopies} />
      <Spacer height={8} />
      <Text variant={TextVariant.t14} color={Color.textBase1}>
        {amount}
      </Text>
      <Spacer height={20} />
    </View>
  );
};
