import {useNavigation} from '@react-navigation/native';

import {WelcomeStackRoutes} from '@app/screens/WelcomeStack';
import {makeID} from '@app/utils';

export const useModal = () => {
  const navigation = useNavigation();

  const showModal = (name, params) =>
    navigation.navigate(WelcomeStackRoutes.Modal, {
      type: name,
      uid: makeID(6),
      ...params,
    });
  const hideModal = () => navigation.goBack();

  return [showModal, hideModal];
};
