import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  Animated as RNAnimated,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {NativeScrollEvent} from 'react-native/Libraries/Components/ScrollView/ScrollView';
import {NativeSyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {Icon, IconButton, Spacer, SwiperIcon, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useAndroidStatusBarAnimation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {WINDOW_WIDTH} from '@app/variables/common';

export type BottomSheetProps = {
  children: React.ReactNode;
  i18nTitle: I18N;
  onClose?: () => void;
  closeDistance?: number;
  scrollable?: boolean;
};

export type BottomSheetRef = {
  open: () => void;
  close: () => void;
};

const AnimatedStatusBar = RNAnimated.createAnimatedComponent(StatusBar);

type pointsT = [number, number];

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  ({children, onClose, i18nTitle, closeDistance}, ref) => {
    const {height} = useWindowDimensions();
    const {bottom: bottomInsets, top: topInsets} = useSafeAreaInsets();

    const bottomSheetHeight = height - (topInsets + 12);
    const snapPointFromTop: pointsT = [0, bottomSheetHeight];

    const fullyOpenSnapPoint = snapPointFromTop[0];
    const closedSnapPoint = snapPointFromTop[snapPointFromTop.length - 1];
    const mockedSnapPointFromTop: pointsT = [
      fullyOpenSnapPoint,
      closeDistance ? closeDistance * 2 : closedSnapPoint,
    ];

    const panGestureRef = useRef(Gesture.Pan());
    const blockScrollUntilAtTheTopRef = useRef(Gesture.Tap());
    const [snapPoint, setSnapPoint] = useState(closedSnapPoint);
    const translationY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const bottomSheetTranslateY = useSharedValue(closedSnapPoint);

    const onHandlerEndOnJS = (point: number) => {
      setSnapPoint(point);
    };

    const onHandlerEnd = ({velocityY}: PanGestureHandlerEventPayload) => {
      'worklet';
      const dragToss = 0.25;
      const endOffsetY =
        bottomSheetTranslateY.value + translationY.value + velocityY * dragToss;

      let destSnapPoint = fullyOpenSnapPoint;

      if (snapPoint === fullyOpenSnapPoint && endOffsetY < fullyOpenSnapPoint) {
        return;
      }

      mockedSnapPointFromTop.forEach((point, id) => {
        const distFromSnap = Math.abs(point - endOffsetY);
        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
          destSnapPoint = snapPointFromTop[id];
        }
      });

      bottomSheetTranslateY.value =
        bottomSheetTranslateY.value + translationY.value;
      translationY.value = 0;

      bottomSheetTranslateY.value = withTiming(
        destSnapPoint,
        {
          duration: 500,
        },
        success => {
          if (destSnapPoint === closedSnapPoint && success) {
            onClose && runOnJS(onClose)();
          }
        },
      );
      runOnJS(onHandlerEndOnJS)(destSnapPoint);
    };

    const clampedTranslateY = useDerivedValue(() => {
      const translateY = bottomSheetTranslateY.value + translationY.value;

      const minTranslateY = Math.max(fullyOpenSnapPoint, translateY);
      return Math.min(closedSnapPoint, minTranslateY);
    });
    const {toDark, toLight, backgroundColor} = useAndroidStatusBarAnimation({
      animatedValueRange: snapPointFromTop,
    });

    const panGesture = Gesture.Pan()
      .onUpdate(e => {
        if (snapPoint === fullyOpenSnapPoint) {
          translationY.value = e.translationY - scrollOffset.value;
        } else {
          translationY.value = e.translationY;
        }
      })
      .onEnd(onHandlerEnd)
      .withRef(panGestureRef);

    const blockScrollUntilAtTheTop = Gesture.Tap()
      .maxDeltaY(snapPoint - fullyOpenSnapPoint)
      .maxDuration(100000)
      .simultaneousWithExternalGesture(panGesture)
      .withRef(blockScrollUntilAtTheTopRef);

    const headerGesture = Gesture.Pan()
      .onUpdate(e => {
        translationY.value = e.translationY;
      })
      .onEnd(onHandlerEnd);

    const scrollViewGesture = Gesture.Native().requireExternalGestureToFail(
      blockScrollUntilAtTheTop,
    );

    const onClosePopup = useCallback(() => {
      toLight();
      bottomSheetTranslateY.value = withTiming(
        closedSnapPoint,
        {
          duration: 400,
          easing: Easing.bezierFn(0.16, 1, 0.3, 1),
        },
        () => onClose && runOnJS(onClose)(),
      );
    }, [bottomSheetTranslateY, closedSnapPoint, onClose, toLight]);

    const onOpenPopup = useCallback(() => {
      toDark();
      bottomSheetTranslateY.value = withTiming(fullyOpenSnapPoint, {
        duration: 400,
        easing: Easing.bezierFn(0.16, 1, 0.3, 1),
      });
    }, [bottomSheetTranslateY, fullyOpenSnapPoint, toDark]);

    useEffect(() => {
      onOpenPopup();
    }, [onOpenPopup]);

    const backgroundAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        clampedTranslateY.value,
        snapPointFromTop,
        [1, 0],
      );
      return {
        opacity,
      };
    });

    const bottomSheetStyle = useAnimatedStyle(() => {
      return {
        maxHeight: bottomSheetHeight,
        transform: [{translateY: clampedTranslateY.value}],
      };
    });

    useImperativeHandle(ref, () => ({
      close: onClosePopup,
      open: onOpenPopup,
    }));

    return (
      <View style={[StyleSheet.absoluteFill, page.container]}>
        <View style={page.wrap}>
          <AnimatedStatusBar backgroundColor={backgroundColor} />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              page.background,
              backgroundAnimatedStyle,
            ]}
          />
          <TouchableWithoutFeedback onPress={onClosePopup}>
            <View style={page.space} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[page.animateView, page.content, bottomSheetStyle]}>
            <GestureDetector gesture={headerGesture}>
              <Animated.View>
                <View style={page.swipe}>
                  <SwiperIcon color={getColor(Color.graphicSecond2)} />
                </View>
                <View style={page.header}>
                  <Text t6 color={Color.textBase1} i18n={i18nTitle} />
                  <Spacer />
                  <IconButton onPress={onClosePopup}>
                    <Icon
                      i24
                      name="close_circle"
                      color={Color.graphicSecond2}
                    />
                  </IconButton>
                </View>
              </Animated.View>
            </GestureDetector>
            <GestureDetector
              gesture={Gesture.Simultaneous(panGesture, scrollViewGesture)}>
              <Animated.ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={1}
                onScrollBeginDrag={(
                  e: NativeSyntheticEvent<NativeScrollEvent>,
                ) => {
                  scrollOffset.value = e.nativeEvent.contentOffset.y;
                }}>
                {children}
                <Spacer style={{height: bottomInsets}} />
              </Animated.ScrollView>
            </GestureDetector>
          </Animated.View>
        </View>
      </View>
    );
  },
);
const page = createTheme({
  wrap: {flex: 1},
  container: {
    justifyContent: 'flex-end',
    zIndex: 5,
  },
  space: {flex: 1},
  background: {
    backgroundColor: Color.bg9,
  },
  animateView: {
    justifyContent: 'flex-end',
  },
  swipe: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 2,
  },
  content: {
    width: WINDOW_WIDTH,
    backgroundColor: Color.bg1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    height: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
