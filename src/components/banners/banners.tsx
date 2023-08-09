import React from 'react';

import {ScrollView, View} from 'react-native';
import {Results} from 'realm';

import {HomeBanner, HomeBannerProps} from '@app/components/home-banner';
import {createTheme, getWindowWidth} from '@app/helpers';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {Banner} from '@app/models/banner';

import {First, Spacer} from '../ui';

export type BannersProps = {
  banners: Results<Banner>;
  onPressBanner: HomeBannerProps['onPress'];
};
export const Banners = ({banners, onPressBanner}: BannersProps) => {
  const snapToInterval = useCalculatedDimensionsValue(({width}) => width - 80);

  if (!banners.length) {
    return null;
  }

  return (
    <>
      <Spacer height={20} />
      <First>
        {banners.length === 1 && (
          <View style={styles.container}>
            <HomeBanner banner={banners[0]} onPress={onPressBanner} />
          </View>
        )}
        <ScrollView
          horizontal
          pagingEnabled
          decelerationRate={0}
          snapToInterval={snapToInterval}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          snapToAlignment="center">
          {banners.map(b => (
            <HomeBanner
              key={b.id}
              banner={b}
              onPress={onPressBanner}
              style={styles.banner}
            />
          ))}
        </ScrollView>
      </First>
      <Spacer height={24} />
    </>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 15,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  banner: {
    width: () => getWindowWidth() - 80,
  },
});
