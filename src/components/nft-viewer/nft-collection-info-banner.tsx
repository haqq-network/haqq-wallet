import React, {useCallback, useMemo} from 'react';

import {ImageBackground, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {useLayout} from '@app/hooks/use-layout';
import {I18N} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {NftItem} from '@app/types';
import {addOpacityToColor, getRandomItemFromArray} from '@app/utils';
import {WEI} from '@app/variables/common';

type Props = {
  data: NftItem[];
  onPress?(item: NftItem): void;
};

export const NftCollectionInfoBanner = ({data, onPress}: Props) => {
  const [layout, onLayout] = useLayout();
  const item = useMemo(() => getRandomItemFromArray(data), [data]);
  const collection = Nft.getCollectionById(item.id);

  const lastSalePrice = useMemo(
    () => cleanNumber(parseInt(item.price, 16) / WEI),
    [item],
  );
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={handlePress}
      style={styles.container}
      onLayout={onLayout}>
      <ImageBackground
        imageStyle={styles.imageContainer}
        style={layout}
        source={{uri: item.image}}>
        <View style={styles.itemHeaderText}>
          <Text t8 color={Color.textBase3} i18n={I18N.nftWidgetTitle} />
          <Spacer width={8} />
          <Text
            t14
            color={Color.textBase3}
            i18n={I18N.nftWidgetItems}
            i18params={{
              count: String(collection?.data?.length || 0),
            }}
          />
        </View>
        <Spacer />
        <View style={styles.itemInfoText}>
          <Text numberOfLines={1} t15 color={Color.textBase3}>
            {item.name}
          </Text>
          <Spacer width={6} />
          <Text t17 color={Color.textSecond2}>
            {lastSalePrice} ISLM
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const ITEM_TEXT_POSSITION_OFFSET = 8;
const LEFT_OFFSET = 20;

const styles = createTheme({
  itemHeaderText: {
    flexDirection: 'row',
    paddingLeft: LEFT_OFFSET,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: addOpacityToColor(Color.bg10, 0.3),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageContainer: {
    borderRadius: 12,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: '100%',
    height: 167,
    backgroundColor: Color.bg9,
  },
  itemInfoText: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: addOpacityToColor(Color.bg9, 0.6),
    borderRadius: 4,
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginRight: ITEM_TEXT_POSSITION_OFFSET,
    bottom: ITEM_TEXT_POSSITION_OFFSET,
    left: LEFT_OFFSET,
  },
});
