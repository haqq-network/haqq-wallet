import {ImageURISource} from 'react-native/Libraries/Image/ImageSource';

import {useThemeSelector} from '@app/hooks/use-theme-selector';
import {NftItem} from '@app/models/nft';
import {getRandomItemFromArray} from '@app/utils';

export const useNftCollectionImage = (
  nfts: NftItem[],
  enableSVG = false,
): ImageURISource => {
  const placeholder = useThemeSelector({
    light: require('@assets/images/nft_placeholder_light.png'),
    dark: require('@assets/images/nft_placeholder_dark.png'),
  });

  if (!nfts.length) {
    return placeholder;
  }

  const nft = getRandomItemFromArray(nfts);

  if (enableSVG && nft.metadata?.image?.startsWith?.('data:image')) {
    return {uri: nft.metadata.image};
  }

  if (!nft.cached_url) {
    return placeholder;
  }

  return {uri: nft.cached_url};
};
