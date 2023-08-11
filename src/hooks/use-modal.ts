import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';
import {makeID} from '@app/utils';

type UseModal = [(name: string, params?: any) => void, () => void];

export const useModal = (): UseModal => {
  const navigation = useTypedNavigation<WelcomeStackParamList>();

  const showModal = (name: string, params?: any) =>
    navigation.navigate(WelcomeStackRoutes.Modal, {
      type: name,
      uid: makeID(6),
      ...params,
    });
  const hideModal = () => navigation.goBack();

  return [showModal, hideModal];
};
