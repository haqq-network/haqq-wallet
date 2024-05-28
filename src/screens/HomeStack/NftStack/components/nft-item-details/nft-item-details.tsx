import React from 'react';

import {SafeAreaView, ScrollView, View} from 'react-native';

import {ImageWrapper} from '@app/components/image-wrapper';
import {
  Button,
  ButtonVariant,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {useLayout} from '@app/hooks/use-layout';
import {I18N} from '@app/i18n';
import {NftItem} from '@app/models/nft';

import {
  NftItemDetailsAttributes,
  NftItemDetailsDescription,
  NftItemDetailsPrice,
  NftItemDetailsTokenId,
} from './components';

export interface NftItemDetailsProps {
  item: NftItem;

  onPressSend(): void;
}

export const NftItemDetails = ({item, onPressSend}: NftItemDetailsProps) => {
  const [imageLayout, onImageLayout] = useLayout();
  const imageUri = useNftImage(item.cached_url);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer} onLayout={onImageLayout}>
          <ImageWrapper
            resizeMode="contain"
            source={imageUri}
            style={{
              width: imageLayout.width,
              height: imageLayout.width,
            }}
            borderRadius={12}
          />
        </View>
        <Spacer height={20} />
        <Text variant={TextVariant.t5}>{item.name}</Text>
        <Spacer height={16} />
        <NftItemDetailsDescription description={item.description} />
        <NftItemDetailsPrice price={item.price} />
        <NftItemDetailsTokenId tokenId={item.tokenId} />
        <NftItemDetailsAttributes attributes={item.attributes} />
      </ScrollView>
      {!item.is_transfer_prohibinden && (
        <View>
          <Spacer height={16} />
          <Button
            i18n={I18N.nftDetailsSend}
            variant={ButtonVariant.contained}
            onPress={onPressSend}
          />
          <Spacer height={16} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 12,
  },
});
