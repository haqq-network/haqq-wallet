import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {getNewsDetailAppTitle} from '@app/helpers/get-news-detail-title';
import {I18N, getText} from '@app/i18n';
import {NewsStackParamList, NewsStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {HomeNewsScreen} from '@app/screens/HomeStack/HomeNewsStack/home-news';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {OurNewsScreen} from '@app/screens/HomeStack/HomeNewsStack/our-news';

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
          //@ts-ignore
          disableMargin: true,
          title: getText(I18N.ourNewsTitle),
        }}
      />
    </Stack.Navigator>
  );
});

export {HomeNewsStack};
