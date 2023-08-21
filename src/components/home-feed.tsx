import React from 'react';

import {ScrollView} from 'react-native';

import {createTheme} from '@app/helpers';
import {BannersWrapper} from '@app/screens/banners';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {WalletsWrapper} from '@app/screens/wallets';
import {WidgetRoot} from '@app/widgets';

export const HomeFeed = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}>
      <LockedTokensWrapper />
      <WalletsWrapper />
      <BannersWrapper />
      <WidgetRoot />
    </ScrollView>
  );
};

const styles = createTheme({
  contentContainerStyle: {flex: 0, paddingBottom: 20},
  container: {
    flex: 1,
  },
});
