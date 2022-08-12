import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';

type HomeScreenProp = CompositeScreenProps<any, any>;
const Tab = createBottomTabNavigator();
export const HomeScreen = ({}: HomeScreenProp) => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="home-feed" component={HomeFeedScreen} />
      <Tab.Screen name="home-settings" component={HomeSettingsScreen} />
    </Tab.Navigator>
  );
};
