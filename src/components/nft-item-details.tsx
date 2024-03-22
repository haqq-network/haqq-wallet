import React from 'react';

import {SafeAreaView, ScrollView, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {useLayout} from '@app/hooks/use-layout';
import {I18N} from '@app/i18n';
import {NftItem} from '@app/models/nft';

import {ImageWrapper} from './image-wrapper';
import {Button, ButtonVariant, Spacer, Text, TextVariant} from './ui';
import {TrimmedText} from './ui/trimmed-text';

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
        <Text variant={TextVariant.t12} i18n={I18N.nftDetailsDescription} />
        <Spacer height={8} />
        <TrimmedText
          limit={100}
          variant={TextVariant.t14}
          color={Color.textBase2}>
          {item.description}
        </TrimmedText>
        <Spacer height={20} />
        <Text variant={TextVariant.t12} i18n={I18N.nftDetailsLastSalePrice} />
        <Spacer height={8} />
        <Text variant={TextVariant.t14} color={Color.textBase1}>
          {item.price.toBalanceString()}
        </Text>
        <Spacer height={20} />
        <Text variant={TextVariant.t12} i18n={I18N.nftDetailsAttributes} />
        <Spacer height={8} />
        {/*<View style={styles.attributeListContainer}>*/}
        {/*  {item.attributes?.map?.(attr => {*/}
        {/*    return (*/}
        {/*      <View key={attr.trait_type} style={styles.attributeContainer}>*/}
        {/*        <View style={styles.attributeValueContainer}>*/}
        {/*          <Text t13>{attr.value}</Text>*/}
        {/*          <Text t13>{attr.frequency * 100}%</Text>*/}
        {/*        </View>*/}
        {/*        <Text t15 color={Color.textBase2}>*/}
        {/*          {attr.trait_type}*/}
        {/*        </Text>*/}
        {/*      </View>*/}
        {/*    );*/}
        {/*  })}*/}
        {/*</View>*/}
      </ScrollView>
      <View>
        <Spacer height={16} />
        <Button
          i18n={I18N.nftDetailsSend}
          variant={ButtonVariant.contained}
          onPress={onPressSend}
        />
        <Spacer height={16} />
      </View>
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
  imageContainer: {
    width: '100%',
    borderRadius: 12,
  },
  // attributeListContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   columnGap: 12,
  // },
  // attributeContainer: {
  //   borderRadius: 10,
  //   width: '48%',
  //   padding: 8,
  //   backgroundColor: Color.bg3,
  //   marginBottom: 12,
  // },
  // attributeValueContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  // },
});
