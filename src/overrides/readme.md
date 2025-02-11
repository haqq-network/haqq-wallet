# Override imports statement

This folder is used to override imports from libraries. The folders inside are accessible via the alias `@override/*`. This is useful for scenarios such as testing with **Jest**, where certain functionalities may not work as expected.

For example, `useAnimatedStyle` from `react-native-reanimated` does not work with **Jest**, so it has been replaced:

```typescript
import ReanimatedDefault from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';

export default ReanimatedDefault;
export * from 'react-native-reanimated';

export const useAnimatedStyle: typeof Reanimated.useAnimatedStyle =
  IS_JEST
    ? factory => {
        return factory();
      }
    : Reanimated.useAnimatedStyle;
```
