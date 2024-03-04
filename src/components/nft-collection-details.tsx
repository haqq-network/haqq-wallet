import React from 'react';

import {observer} from 'mobx-react';
import {SafeAreaView, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {HaqqCosmosAddress, NftItem} from '@app/types';

import {ImageWrapper} from './image-wrapper';
import {NftViewerItemPreviewVariant} from './nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview';
import {NftViewerItemPreviewList} from './nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview-list';
import {Spacer, Text} from './ui';

export interface NftCollectionDetailsProps {
  collectionId: HaqqCosmosAddress;
  onPressNftItem(item: NftItem): void;
}

export const NftCollectionDetails = observer(
  ({onPressNftItem, collectionId}: NftCollectionDetailsProps) => {
    const collection = Nft.getCollectionById(collectionId);
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View>
            <ImageWrapper
              resizeMode="cover"
              source={{uri: collection.icon ?? collection.data[0]?.image}}
              style={styles.image}
              borderRadius={12}
            />
          </View>
          <Spacer height={20} />
          <Text t5>{collection.name}</Text>
          <Spacer height={16} />
          <Text t12 i18n={I18N.nftDetailsDescription} />
          <Spacer height={8} />
          {/*TODO Description support for collections*/}
          {/*<TrimmedText limit={100} t14 color={Color.textBase2}>*/}
          {/*  {collection.description}*/}
          {/*</TrimmedText>*/}
          <Spacer height={16} />
          <Text t12 i18n={I18N.nftDetailsYourItems} />
          <Spacer height={8} />
          <View>
            <NftViewerItemPreviewList
              scrollEnabled={false}
              variant={NftViewerItemPreviewVariant.large}
              data={collection.data}
              onPress={onPressNftItem}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  },
);

const styles = createTheme({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  image: {
    height: 120,
    width: '100%',
  },
});
