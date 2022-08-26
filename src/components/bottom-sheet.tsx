import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {BG_1} from '../variables';

export type BottomSheetProps = {
  children: React.ReactNode;
  onClose: () => void;
};

const h = Dimensions.get('window').height;

export const BottomSheet = ({children, onClose}: BottomSheetProps) => {
  const pan = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        pan.setValue(gestureState.dy / h);
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > h / 3) {
          onClosePopup();
        } else {
          onOpenPopup();
        }
      },
    }),
  ).current;

  const onClosePopup = useCallback(() => {
    Animated.spring(pan, {
      toValue: 1,
      useNativeDriver: false,
    }).start(onClose);
  }, [pan, onClose]);

  const onOpenPopup = useCallback(() => {
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  }, [pan]);

  useEffect(() => {
    onOpenPopup();
  }, [onOpenPopup]);

  return (
    <View style={[StyleSheet.absoluteFill, {justifyContent: 'flex-end'}]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#000000',
            opacity: pan.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <TouchableWithoutFeedback onPress={onClosePopup}>
        <View style={{flex: 1}} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          flex: 1,
          transform: [{translateY: Animated.multiply(pan, h)}],
          justifyContent: 'flex-end',
        }}
        {...panResponder.panHandlers}>
        <View style={page.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: Dimensions.get('window').width,
    backgroundColor: BG_1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
