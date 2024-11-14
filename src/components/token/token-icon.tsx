import {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';

import {TokenIconProps} from './token.types';

import {ImageWrapper} from '../image-wrapper';

export const TokenIcon = ({item}: TokenIconProps) => {
  const providerImage = useMemo(() => {
    const p = Provider.getByEthChainId(item.chain_id);

    if (!Provider.isAllNetworks || !p) {
      return undefined;
    }

    return p.icon;
  }, [item.chain_id]);

  return (
    <View>
      <ImageWrapper
        style={styles.icon}
        source={item?.image || require('@assets/images/empty-icon.png')}
        resizeMode="cover"
      />
      {providerImage && (
        <ImageWrapper
          style={styles.providerIcon}
          source={providerImage || require('@assets/images/empty-icon.png')}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = createTheme({
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  providerIcon: {
    position: 'absolute',
    top: 0,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Color.bg1,
  },
});
