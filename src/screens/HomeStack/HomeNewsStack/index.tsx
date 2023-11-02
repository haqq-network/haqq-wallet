import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {getNewsDetailAppTitle} from '@app/helpers/get-news-detail-title';
import {I18N, getText} from '@app/i18n';
import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {HomeNewsScreen} from '@app/screens/HomeStack/HomeNewsStack/home-news';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {OurNewsScreen} from '@app/screens/HomeStack/HomeNewsStack/our-news';

export enum NewsStackRoutes {
  News = 'homeNews_',
  NewsDetail = 'newsDetail',
  OurNews = 'ourNews',
}

export type NewsStackParamList = HomeStackParamList & {
  [NewsStackRoutes.News]: undefined;
  [NewsStackRoutes.NewsDetail]: {
    id: string;
  };
  [NewsStackRoutes.OurNews]: undefined;
};

const Stack = createNativeStackNavigator<NewsStackParamList>();

const HomeNewsStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={NewsStackRoutes.News}
      screenOptions={basicScreenOptions}>
      <Stack.Screen name={NewsStackRoutes.News} component={HomeNewsScreen} />
      <Stack.Screen
        name={NewsStackRoutes.NewsDetail}
        component={NewsDetailScreen}
        options={getNewsDetailAppTitle}
      />
      <Stack.Screen
        name={NewsStackRoutes.OurNews}
        component={OurNewsScreen}
        options={{
          ...popupScreenOptions,
          headerShown: true,
          title: getText(I18N.ourNewsTitle),
        }}
      />
    </Stack.Navigator>
  );
});

export {HomeNewsStack};
