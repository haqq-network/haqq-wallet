import {ImageURISource} from 'react-native/Libraries/Image/ImageSource';

import {useThemeSelector} from '@app/hooks/use-theme-selector';

export const useNftImage = (imageUrl?: string | null): ImageURISource => {
  const placeholder = useThemeSelector({
    light: require('@assets/images/nft_placeholder_light.png'),
    dark: require('@assets/images/nft_placeholder_dark.png'),
  });

  if (!imageUrl) {
    return placeholder;
  }

  if (imageUrl.startsWith('ipfs://')) {
    return {uri: imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')};
  }

  return {uri: imageUrl};
};
