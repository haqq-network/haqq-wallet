import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  TouchableWithoutFeedback,
  View,
  Animated as RNAnimated,
} from 'react-native';
import {
  BG_1,
  GRAPHIC_SECOND_2,
  GRAPHIC_SECOND_5,
  TEXT_BASE_1,
} from '../variables';
import {CloseCircle, IconButton, Spacer, SwiperIcon, Text} from './ui';
import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {useAndroidStatusBarAnimation} from '../hooks';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type BottomSheetProps = {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
  closeDistance?: number;
  scrollable?: boolean;
};

const AnimatedStatusBar = RNAnimated.createAnimatedComponent(StatusBar);

type pointsT = [number, number];

export const BottomSheet = ({
  children,
  onClose,
  title,
  closeDistance,
}: BottomSheetProps) => {
  const {height} = useWindowDimensions();
  const {bottom: bottomInsets} = useSafeAreaInsets();

  const bottomSheetHeight = height * 0.75;
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
    const dragToss = 0.05;
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
          runOnJS(onClose)();
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
        duration: 500,
      },
      () => runOnJS(onClose)(),
    );
  }, [bottomSheetTranslateY, closedSnapPoint, onClose, toLight]);

  const onOpenPopup = useCallback(() => {
    toDark();
    bottomSheetTranslateY.value = withTiming(fullyOpenSnapPoint, {
      duration: 500,
    });
  }, [bottomSheetTranslateY, fullyOpenSnapPoint, toDark]);

  useEffect(() => {
    onOpenPopup();
  }, [onOpenPopup]);

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      clampedTranslateY.value,
      snapPointFromTop,
      [0.5, 0],
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

  return (
    <View style={[StyleSheet.absoluteFill, page.container]}>
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
      <Animated.View style={[page.animateView, page.content, bottomSheetStyle]}>
        <GestureDetector gesture={headerGesture}>
          <Animated.View>
            <View style={page.swipe}>
              <SwiperIcon color={GRAPHIC_SECOND_2} />
            </View>
            <View style={page.header}>
              <Text t6 style={page.title}>
                {title}
              </Text>
              <Spacer />
              <IconButton onPress={onClosePopup}>
                <CloseCircle color={GRAPHIC_SECOND_2} />
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
            onScrollBeginDrag={e => {
              scrollOffset.value = e.nativeEvent.contentOffset.y;
            }}>
            {children}
            <Spacer style={{height: bottomInsets}} />
          </Animated.ScrollView>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  space: {flex: 1},
  background: {
    backgroundColor: GRAPHIC_SECOND_5,
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
    width: Dimensions.get('window').width,
    backgroundColor: BG_1,
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
  title: {fontWeight: '600', color: TEXT_BASE_1},
});
