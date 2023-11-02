import {ParamListBase, RouteProp, useRoute} from '@react-navigation/native';

export function useTypedRoute<K extends ParamListBase, T extends keyof K>() {
  return useRoute<RouteProp<K, T>>();
}
