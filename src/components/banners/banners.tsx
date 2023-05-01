import React from 'react';

import {ScrollView, View} from 'react-native';
import {Results} from 'realm';

import {HomeBanner, HomeBannerProps} from '@app/components/home-banner';
import {createTheme} from '@app/helpers';
import {Banner} from '@app/models/banner';
import {WINDOW_WIDTH} from '@app/variables/common';

export type BannersProps = {
  banners: Results<Banner>;
  onPressBanner: HomeBannerProps['onPress'];
};
export const Banners = ({banners, onPressBanner}: BannersProps) => {
  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <View style={styles.container}>
        <HomeBanner key={banner.id} banner={banner} onPress={onPressBanner} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate={0}
      snapToInterval={WINDOW_WIDTH - 110}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={styles.scrollContainer}
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
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  scrollContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    overflow: 'visible',
  },
  banner: {
    width: WINDOW_WIDTH - 120,
  },
});
