import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {CreateAgreement} from '../components/create-agreement';

export const SignUpAgreementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'createAgreement'>>();
  const onPressAgree = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'onboardingSetupPin');
  }, [navigation, route.params.nextScreen]);

  return <CreateAgreement testID="signup_agreement" onDone={onPressAgree} />;
};
