import React from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {Spacer, Text, TextPosition, TextVariant} from '@app/components/ui';
import {ProviderMenu} from '@app/components/ui/provider-menu';
import {createTheme, popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {GovernanceStack} from '@app/screens/HomeStack/GovernanceStack';
import {HomeEarnStack} from '@app/screens/HomeStack/HomeEarnStack';
import {HomeFeedScreen} from '@app/screens/HomeStack/HomeFeedStack/home-feed';
import {HomeStoriesScreen} from '@app/screens/HomeStack/HomeFeedStack/home-stories';

const Stack = createNativeStackNavigator<HomeFeedStackParamList>();

const fullScreenModal: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
};

const HomeFeedStack = observer(() => {
  return (
    <Stack.Navigator screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeFeed}
        component={HomeFeedScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          headerShown: true,
          headerTitle: () => {
            return (
              <View>
                <Text
                  variant={TextVariant.t8}
                  position={TextPosition.center}
                  color={Color.textBase1}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.text}>
                  {getText(I18N.homeWalletTitle)}
                </Text>
                <ProviderMenu />
              </View>
            );
          },
          headerRight: QrScannerButton,
          headerLeft: () => <Spacer width={20} />,
        }}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.Governance}
        component={GovernanceStack}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeEarn}
        component={HomeEarnStack}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeStories}
        component={HomeStoriesScreen}
        options={fullScreenModal}
      />
    </Stack.Navigator>
  );
});

const styles = createTheme({
  text: {
    marginHorizontal: 8,
  },
});

export {HomeFeedStack};
