import React from 'react';

import {SafeAreaView, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftCollectionImage} from '@app/hooks/nft';
import {I18N} from '@app/i18n';
import {NftCollection, NftItem} from '@app/models/nft';
import {NftWidgetSize} from '@app/types';

import {ImageWrapper} from './image-wrapper';
import {NftViewerItemPreviewList} from './nft-viewer/nft-viewer-item-preview-list';
import {Spacer, Text, TextVariant} from './ui';
import {TrimmedText} from './ui/trimmed-text';

export interface NftCollectionDetailsProps {
  item: NftCollection;

  onPressNftItem(item: NftItem): void;
}

export const NftCollectionDetails = ({
  item,
  onPressNftItem,
}: NftCollectionDetailsProps) => {
  const collectionImageUri = useNftCollectionImage(item.nfts);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <ImageWrapper
            resizeMode="cover"
            source={collectionImageUri}
            style={styles.image}
            borderRadius={12}
          />
        </View>
        <Spacer height={20} />
        <Text variant={TextVariant.t5}>{item.name}</Text>
        <Spacer height={16} />
        <Text variant={TextVariant.t12} i18n={I18N.nftDetailsDescription} />
        <Spacer height={8} />
        <TrimmedText
          limit={100}
          variant={TextVariant.t14}
          color={Color.textBase2}>
          {item.description}
        </TrimmedText>
        <Spacer height={16} />
        <Text variant={TextVariant.t12} i18n={I18N.nftDetailsYourItems} />
        <Spacer height={8} />
        <View>
          <NftViewerItemPreviewList
            variant={NftWidgetSize.large}
            data={item.nfts}
            onPress={onPressNftItem}
          />
        </View>
      </ScrollView>
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
  image: {
    height: 120,
    width: '100%',
  },
});
