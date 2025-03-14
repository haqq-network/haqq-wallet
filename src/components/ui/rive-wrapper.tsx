import React from 'react';

import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Rive, {
  Alignment,
  Fit,
  LoopMode,
  RNRiveError,
  RiveRef,
} from 'rive-react-native';
import {XOR} from 'rive-react-native/src/helpers';

import {AppStore} from '@app/models/app';

type RiveWrapperProps = {
  width: DimensionValue;
  height: DimensionValue;
  style?: StyleProp<ViewStyle>;
  onPlay?: (animationName: string, isStateMachine: boolean) => void;
  onPause?: (animationName: string, isStateMachine: boolean) => void;
  onStop?: (animationName: string, isStateMachine: boolean) => void;
  onLoopEnd?: (animationName: string, loopMode: LoopMode) => void;
  onStateChanged?: (stateMachineName: string, stateName: string) => void;
  onError?: (rnRiveError: RNRiveError) => void;
  fit?: Fit;
  testID?: string;
  alignment?: Alignment;
  artboardName?: string;
  animationName?: string;
  stateMachineName?: string;
  autoplay?: boolean;
  enableClickToAnimation?: boolean;
} & XOR<
  {
    resourceName: string;
  },
  {
    url: string;
  }
>;

export const RiveWrapper = React.forwardRef<RiveRef, RiveWrapperProps>(
  (
    {
      height,
      width,
      style,
      enableClickToAnimation = false,
      autoplay = false,
      ...props
    }: RiveWrapperProps,
    ref,
  ) => {
    return (
      <View
        style={[styles.container, {minWidth: width, minHeight: height}, style]}>
        <Rive
          ref={ref}
          style={{width, height}}
          autoplay={AppStore.isDetoxRunning ? false : autoplay}
          {...props}
        />
        {/* if you unmount the component while clicking on the animation, the application will crash */}
        {/* View component below prevent click  */}
        {(!enableClickToAnimation || AppStore.isDetoxRunning) && (
          <View style={styles.overlay} />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
