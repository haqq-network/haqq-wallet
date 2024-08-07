import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';

import {TotalValueTabNames} from '@app/components/total-value-info';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {useTypedNavigation} from '@app/hooks';
import {useShowNft} from '@app/hooks/nft';
import {HomeStackRoutes} from '@app/route-types';
import {INftWidget, NftWidgetSize} from '@app/types';

import {NftCollectionView, NftListView} from './components';

export const NftWidgetWrapper = observer(({size}: INftWidget) => {
  const navigation = useTypedNavigation();

  const onPress = useCallback(() => {
    navigation.navigate(HomeStackRoutes.TotalValueInfo, {
      tab: TotalValueTabNames.nft,
    });
  }, []);

  const showNft = useShowNft();

  if (!showNft) {
    return null;
  }

  switch (size) {
    case NftWidgetSize.large:
      return (
        <ShadowCard disablePadding onPress={onPress}>
          <NftCollectionView />
        </ShadowCard>
      );
    case NftWidgetSize.small:
    case NftWidgetSize.medium:
    default:
      return (
        <ShadowCard onPress={onPress} style={styles.paddingLeft}>
          <NftListView />
        </ShadowCard>
      );
  }
});

const styles = StyleSheet.create({
  paddingLeft: {
    paddingLeft: 16,
  },
});
