import {ViewProps} from 'react-native';

export interface KeyboardSafeAreaProps extends ViewProps {
  isNumeric?: boolean;
  sharedValue?: SharedValue<number>;
}

export function KeyboardSafeArea(props: KeyboardSafeAreaProps): JSX.Element;
