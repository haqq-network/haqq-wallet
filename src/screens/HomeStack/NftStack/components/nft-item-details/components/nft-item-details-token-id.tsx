import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

type Props = {
  tokenId: number;
  amount: number;
};

export const NftItemDetailsTokenId = ({tokenId, amount}: Props) => {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.item}>
          <Text variant={TextVariant.t12} i18n={I18N.nftDetailsTokenId} />
          <Spacer height={8} />
          <Text variant={TextVariant.t14} color={Color.textBase1}>
            {tokenId}
          </Text>
        </View>

        <View style={styles.item}>
          <Text
            variant={TextVariant.t12}
            i18n={I18N.nftDetailsNumbersOfCopies}
          />
          <Spacer height={8} />
          <Text variant={TextVariant.t14} color={Color.textBase1}>
            {amount}
          </Text>
        </View>
      </View>
      <Spacer height={20} />
    </>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
  },
});
