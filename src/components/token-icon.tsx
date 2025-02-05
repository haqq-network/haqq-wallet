import {useMemo} from 'react';

import {toJS} from 'mobx';
import {Image, ImageStyle, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';
import {IToken} from '@app/types';

type TokenIconProps = {
  asset: IToken | null;
  width: number;
  height: number;
  iconWidth?: number;
  iconHeight?: number;
  viewStyle?: ViewStyle;
};

export const TokenIcon = ({
  asset,
  width,
  height,
  iconWidth,
  iconHeight,
  viewStyle,
}: TokenIconProps) => {
  const imageStyle: ImageStyle = useMemo(
    () => ({width, height}),
    [width, height],
  );
  const iconStyle: ImageStyle = useMemo(
    () => ({
      width: iconWidth ?? width / 2.5,
      height: iconHeight ?? height / 2.5,
      borderRadius: (width / 2.5) * 0.8,
      marginLeft: -8,
      marginBottom: width - height * 0.3,
    }),
    [width, height],
  );

  if (!asset) {
    return null;
  }

  const providerIcon = Provider.getByEthChainId(asset.chain_id)?.icon;
  const providerIconSource = providerIcon ? {uri: providerIcon} : undefined;

  return (
    <View style={[styles.imageContainer, viewStyle]}>
      <Image source={toJS(asset.image)} style={[styles.image, imageStyle]} />
      <Image source={providerIconSource} style={[styles.icon, iconStyle]} />
    </View>
  );
};

const styles = createTheme({
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 38,
    height: 38,
  },
  icon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Color.bg1,
  },
});
