import React, {useCallback} from 'react';

import {RefreshControl, StyleSheet, View} from 'react-native';
import {Results} from 'realm';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {BaseNewsItem} from '@app/types';

import {NewsRowList} from './news';
import {NewsCardCarousel} from './news/news-card-carousel';
import {Button, Icon, IconsName, Spacer, Text} from './ui';

export interface HomeNewsProps {
  ourNews: Results<BaseNewsItem>;
  cryptoNews: Results<BaseNewsItem>;
  refreshing: boolean;
  onRefresh: () => void;
  onPressCryptoNews(id: string): void;
  onPressOurNews(id: string): void;
  onPressViewAll(): void;
}

export function HomeNews({
  ourNews,
  cryptoNews,
  refreshing,
  onPressCryptoNews,
  onPressOurNews,
  onPressViewAll,
  onRefresh,
}: HomeNewsProps) {
  const renderListHeaderComponent = useCallback(
    () => (
      <View>
        <View style={styles.row}>
          <Icon name={IconsName.islm} color={Color.graphicBase1} />
          <Spacer width={9} />
          <Text t5 i18n={I18N.homeNewsOurNews} />
          <Spacer />
          <Button
            i18n={I18N.homeNewsViewAll}
            onPress={onPressViewAll}
            textColor={Color.textGreen1}
          />
        </View>
        <NewsCardCarousel data={ourNews} onPress={onPressOurNews} />
        <Spacer height={32} />
        <View style={styles.row}>
          <Icon name={IconsName.scroll} color={Color.graphicBase1} />
          <Spacer width={9} />
          <Text t5 i18n={I18N.homeNewsCryptoNews} />
        </View>
      </View>
    ),
    [onPressOurNews, onPressViewAll, ourNews],
  );

  return (
    <View style={styles.flexOne}>
      <NewsRowList
        data={cryptoNews}
        onPress={onPressCryptoNews}
        renderListHeaderComponent={renderListHeaderComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: {flex: 1},
  row: {
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
  },
});
