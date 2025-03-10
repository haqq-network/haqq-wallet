import React, {useCallback, useMemo, useState} from 'react';

import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {Renderable} from 'react-native-json-tree';

import {Color} from '@app/colors';
import {ImageWrapper} from '@app/components/image-wrapper';
import {JsonViewer} from '@app/components/json-viewer';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {useLayout} from '@app/hooks/use-layout';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N} from '@app/i18n';
import {NftItem} from '@app/models/nft';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

import {
  NftItemDetailsAttributes,
  NftItemDetailsDescription,
  NftItemDetailsPrice,
  NftItemDetailsTokenId,
} from './components';

export interface NftItemDetailsProps {
  item: NftItem;

  onPressSend(): void;
  onPressExplorer(): void;
}

export const NftItemDetails = ({
  item,
  onPressSend,
  onPressExplorer,
}: NftItemDetailsProps) => {
  const {animate} = useLayoutAnimation();
  const [imageLayout, onImageLayout] = useLayout();
  const wallet = useMemo(() => Wallet.getById(item.address), [item]);
  const imageUri = useNftImage(item?.metadata?.image || item?.cached_url);

  const [isJsonHidden, setJsonHidden] = useState(true);
  const jsonData = useMemo(
    () => ({
      contract: AddressUtils.toEth(item.contract),
      metadata: item.metadata,
    }),
    [item],
  );

  const handleShowJsonViewer = useCallback(() => {
    animate();
    setJsonHidden(false);
  }, [animate]);

  const handleHideJsonViewer = useCallback(() => {
    animate();
    setJsonHidden(true);
  }, [animate]);

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
        <NftItemDetailsTokenId amount={item.amount} tokenId={item.tokenId} />
        <NftItemDetailsAttributes attributes={item.attributes} />

        <Spacer height={20} />

        <View style={styles.jsonViewerContainer}>
          <First>
            {isJsonHidden && (
              <Button
                size={ButtonSize.small}
                i18n={I18N.nftDetailsShowRawInfo}
                onPress={handleShowJsonViewer}
              />
            )}

            <>
              <Button
                size={ButtonSize.small}
                i18n={I18N.nftDetailsHideRawInfo}
                onPress={handleHideJsonViewer}
              />
              <View style={styles.separator} />
              <ScrollView
                horizontal
                style={styles.json}
                showsHorizontalScrollIndicator={false}>
                <JsonViewer
                  autoexpand={false}
                  style={styles.json}
                  data={jsonData as unknown as Renderable}
                />
              </ScrollView>
            </>
          </First>
        </View>
      </ScrollView>

      <Spacer height={16} />
      <IconButton onPress={onPressExplorer} style={styles.iconButton}>
        <Icon name={IconsName.block} color={Color.graphicBase1} />
        <Text
          t9
          i18n={I18N.transactionDetailViewOnBlock}
          style={styles.textStyle}
        />
      </IconButton>

      {!item.is_transfer_prohibinden && (
        <View>
          <Spacer height={16} />
          <Button
            i18n={I18N.nftDetailsSend}
            variant={ButtonVariant.contained}
            disabled={wallet?.type === WalletType.watchOnly}
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
    marginHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 12,
  },
  jsonViewerContainer: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Color.graphicSecond1,
    paddingHorizontal: 20,
  },
  separator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: Color.graphicSecond2,
  },
  json: {
    width: '100%',
  },
  textStyle: {
    marginLeft: 8,
  },
  iconButton: {
    flexDirection: 'row',
  },
});
