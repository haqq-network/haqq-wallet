import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {Platform} from 'react-native';

import {popupScreenOptions} from '@app/helpers';
import {getNewsDetailTitle} from '@app/helpers/get-news-detail-title';
import {I18N, getText} from '@app/i18n';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {NewsListScreen} from '@app/screens/news-list';

const NewsStack = createStackNavigator();

const newsOptions = {
  title: getText(I18N.newsTitle),
  tab: Platform.select({
    ios: true,
    android: true,
  }),
};

const screenOptions = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
};

export const NewsScreen = () => {
  return (
    <NewsStack.Navigator screenOptions={screenOptions}>
      <NewsStack.Screen
        name="newsList"
        component={NewsListScreen}
        options={newsOptions}
      />
      <NewsStack.Screen
        name="newsDetail"
        component={NewsDetailScreen}
        // @ts-ignore
        options={getNewsDetailTitle}
      />
    </NewsStack.Navigator>
  );
};
