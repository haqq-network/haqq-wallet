import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  BG_1,
  GRAPHIC_SECOND_5,
  GRAPHIC_SECOND_2,
  TEXT_BASE_1,
} from '../variables';
import {CloseCircle, IconButton, Text, Spacer, SwiperIcon} from './ui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type BottomSheetProps = {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
  closeDistance?: number;
};

const h = Dimensions.get('window').height;
const defaultCloseDistance = h / 3;

export const BottomSheet = ({
  children,
  onClose,
  title,
  closeDistance = defaultCloseDistance,
}: BottomSheetProps) => {
  const pan = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy >= 0) {
          pan.setValue(gestureState.dy / h);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > closeDistance) {
          onClosePopup();
        } else {
          onOpenPopup();
        }
      },
    }),
  ).current;

  const onClosePopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start(onClose);
  }, [pan, onClose]);

  const onOpenPopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [pan]);

  useEffect(() => {
    onOpenPopup();
  }, [onOpenPopup]);

  return (
    <View style={[StyleSheet.absoluteFill, page.container]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          page.background,
          {
            opacity: pan.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <TouchableWithoutFeedback onPress={onClosePopup}>
        <View style={page.space} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          page.animateView,
          {
            transform: [{translateY: Animated.multiply(pan, h)}],
          },
        ]}
        {...panResponder.panHandlers}>
        <View style={[page.content, {paddingBottom: insets.bottom}]}>
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
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {justifyContent: 'flex-end'},
  space: {flex: 1},
  background: {
    backgroundColor: GRAPHIC_SECOND_5,
  },
  animateView: {
    flex: 1,
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
