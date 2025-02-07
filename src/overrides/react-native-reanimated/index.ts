/* eslint-disable import/no-default-export */
import Default from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';

export default Default;
export * from 'react-native-reanimated';

export const useAnimatedStyle: typeof Reanimated.useAnimatedStyle = IS_JEST
  ? factory => factory()
  : Reanimated.useAnimatedStyle;
