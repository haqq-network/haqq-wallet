import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '../types';

export const useTypedNavigation = () =>
  useNavigation<StackNavigationProp<RootStackParamList>>();
