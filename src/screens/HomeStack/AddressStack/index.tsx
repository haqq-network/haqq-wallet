import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {AddressBookParamList, AddressBookStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {SettingsAddressBookScreen} from '@app/screens/HomeStack/AddressStack/settings-address-book';
import {SettingsContactEditScreen} from '@app/screens/HomeStack/AddressStack/settings-contact-edit';

const screenOptions = {
  ...popupScreenOptionsWithMargin,
  title: 'Address book',
  headerShown: true,
};

const Stack = createNativeStackNavigator<AddressBookParamList>();

const AddressBookStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={AddressBookStackRoutes.SettingsAddressBook}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={AddressBookStackRoutes.SettingsAddressBook}
        component={SettingsAddressBookScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name={AddressBookStackRoutes.SettingsContactEdit}
        component={SettingsContactEditScreen}
      />
    </Stack.Navigator>
  );
});

export {AddressBookStack};
