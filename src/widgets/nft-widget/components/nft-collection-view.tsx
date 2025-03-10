import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {ImageBackground, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {I18N} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {addOpacityToColor, getRandomItemFromArray} from '@app/utils';

export const NftCollectionView = observer(() => {
  const nftCollections = Nft.getAllCollections();
  const collection = useMemo(
    () => getRandomItemFromArray(nftCollections),
    [nftCollections],
  );
  const item = useMemo(
    () => getRandomItemFromArray(collection.nfts),
    [collection],
  );
  const imageUri = useNftImage(item.metadata?.image || item?.cached_url);

  if (!nftCollections.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        imageStyle={styles.imageContainer}
        source={imageUri}>
        <View style={styles.itemHeaderText}>
          <Text
            variant={TextVariant.t8}
            color={Color.textBase3}
            i18n={I18N.nftWidgetTitle}
          />
          <Spacer width={8} />
          <Text
            variant={TextVariant.t14}
            color={Color.textBase3}
            i18n={I18N.nftWidgetItems}
            i18params={{
              count: String(collection?.nfts?.length || 0),
            }}
          />
        </View>
        <Spacer />
        <View style={styles.itemInfoText}>
          <Text
            numberOfLines={1}
            variant={TextVariant.t15}
            color={Color.textBase3}>
            {item.name}
          </Text>
          <Spacer width={6} />
          {item.price && (
            <Text variant={TextVariant.t17} color={Color.textSecond2}>
              {item.price.toBalanceString()}
            </Text>
          )}
        </View>
      </ImageBackground>
    </View>
  );
});

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
    width: '100%',
    height: 167,
  },
  container: {
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
