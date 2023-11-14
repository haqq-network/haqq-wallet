import React from 'react';

import {Image, SafeAreaView, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {NftCollection, NftItem} from '@app/types';

import {NftViewerItemPreviewVariant} from './nft-viewer/nft-viewer-item-preview';
import {NftViewerItemPreviewList} from './nft-viewer/nft-viewer-item-preview-list';
import {Spacer, Text} from './ui';
import {TrimmedText} from './ui/trimmed-text';

export interface NftCollectionDetailsProps {
  item: NftCollection;

  onPressNftItem(item: NftItem): void;
}

export const NftCollectionDetails = ({
  item,
  onPressNftItem,
}: NftCollectionDetailsProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Image
            resizeMode="cover"
            source={{uri: item.image}}
            style={styles.image}
            borderRadius={12}
          />
        </View>
        <Spacer height={20} />
        <Text t5>{item.name}</Text>
        <Spacer height={16} />
        <Text t12 i18n={I18N.nftDetailsDescription} />
        <Spacer height={8} />
        <TrimmedText limit={100} t14 color={Color.textBase2}>
          {item.description}
        </TrimmedText>
        <Spacer height={16} />
        <Text t12 i18n={I18N.nftDetailsYourItems} />
        <Spacer height={8} />
        <View>
          <NftViewerItemPreviewList
            scrollEnabled={false}
            variant={NftViewerItemPreviewVariant.large}
            data={item.items}
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
