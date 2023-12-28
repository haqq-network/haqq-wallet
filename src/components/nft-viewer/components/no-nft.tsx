import React from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export const NoNft = () => {
  return (
    <View style={styles.empty}>
      <Image
        style={styles.emptyImage}
        source={require('@assets/images/none-nft.png')}
      />
      <Spacer height={12} />
      <Text t13 color={Color.textSecond1} i18n={I18N.nftViewerNoNFTs} />
    </View>
  );
};

const styles = createTheme({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    height: 80,
    width: 80,
    tintColor: Color.graphicSecond3,
  },
});
