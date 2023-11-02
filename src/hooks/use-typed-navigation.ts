import {ParamListBase, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

export const useTypedNavigation = <T extends ParamListBase>() =>
  useNavigation<StackNavigationProp<T>>();
