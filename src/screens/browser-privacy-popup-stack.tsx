import React from 'react';

import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import {observer} from 'mobx-react';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {Spacer} from '@app/components/ui';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

import {BrowserPrivacyDetailsScreen} from './browser-privacy-details-screen';
import {BrowserPrivacyScreen} from './browser-privacy-screen';

const BrowserPrivacyStack = createStackNavigator();

const screenOptions: StackNavigationOptions = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerRight: DismissPopupButton,
};

export const BrowserPrivacyPopupStack = observer(() => {
  const route = useTypedRoute<'browserPrivacyPopupStack'>();
  const {screen, params} = route.params;

  return (
    <BrowserPrivacyStack.Navigator
      screenOptions={screenOptions}
      initialRouteName={screen}>
      <BrowserPrivacyStack.Screen
        name={'browserPrivacy'}
        component={BrowserPrivacyScreen}
        initialParams={params}
        options={{
          title: getText(I18N.browserPrivacyTitle),
          headerLeft: () => <Spacer width={24} />,
        }}
      />
      <BrowserPrivacyStack.Screen
        name={'browserPrivacyDetails'}
        component={BrowserPrivacyDetailsScreen}
        initialParams={params}
        options={{
          title: params?.hostname,
        }}
      />
    </BrowserPrivacyStack.Navigator>
  );
});
