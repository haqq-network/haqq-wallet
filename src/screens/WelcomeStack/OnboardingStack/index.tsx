import React, {memo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {
  AnyRouteFromParent,
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/route-types';
import {OnboardingBiometryScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-biometry';
import {OnboardingFinishScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-finish';
import {OnboardingRepeatPinScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-setup-pin';
import {OnboardingTrackUserActivityScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-track-user-activity';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type Props = {
  title: string;
  initialParams: {
    [key in OnboardingStackRoutes]:
      | {
          nextScreen?: AnyRouteFromParent;
        }
      | OnboardingStackParamList[OnboardingStackRoutes.OnboardingFinish];
  };
};

const OnboardingStack = memo(({initialParams, title}: Props) => {
  const screenOptionsWithoutTitle = {
    title: '',
    headerBackHidden: true,
  };
  const screenOptionsWithTitle = {
    title,
    headerBackHidden: true,
  };
  const screenOptionsTitleOnly: NativeStackNavigationOptions = {
    title,
  };

  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingSetupPin}
        component={OnboardingSetupPinScreen}
        options={screenOptionsTitleOnly}
        initialParams={initialParams[OnboardingStackRoutes.OnboardingSetupPin]}
      />
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingRepeatPin}
        component={OnboardingRepeatPinScreen}
        options={screenOptionsTitleOnly}
        initialParams={initialParams[OnboardingStackRoutes.OnboardingRepeatPin]}
      />
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingBiometry}
        component={OnboardingBiometryScreen}
        options={screenOptionsWithTitle}
        initialParams={initialParams[OnboardingStackRoutes.OnboardingBiometry]}
      />
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingTrackUserActivity}
        component={OnboardingTrackUserActivityScreen}
        options={screenOptionsWithTitle}
        initialParams={
          initialParams[OnboardingStackRoutes.OnboardingTrackUserActivity]
        }
      />
      {Object.keys(initialParams[OnboardingStackRoutes.OnboardingFinish])
        .length > 0 && (
        <Stack.Screen
          name={OnboardingStackRoutes.OnboardingFinish}
          component={OnboardingFinishScreen}
          initialParams={initialParams[OnboardingStackRoutes.OnboardingFinish]}
          options={{...screenOptionsWithoutTitle, animation: 'fade'}}
        />
      )}
    </Stack.Navigator>
  );
});

export {OnboardingStack};
