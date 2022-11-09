import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {RestoreAgreement} from '../components/restore-agreement/restore-agreement';
import {RootStackParamList} from '../types';

export const SignInAgreementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'signinAgreement'>>();
  const onDone = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'signinRestoreWallet');
  }, [navigation, route.params.nextScreen]);

  return <RestoreAgreement onDone={onDone} testID="signin_agreement" />;
};
