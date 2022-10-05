import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Paragraph} from './ui';
import {BG_1, BG_9, TEXT_BASE_1} from '../variables';
import {asyncTiming, sleep} from '../utils';

export type NotificationMessageProps = {
  message: string;
  id: string;
  onClose: (id: string) => void;
};

export const NotificationMessage = ({
  message,
  id,
  onClose,
}: NotificationMessageProps) => {
  const pan = useRef(new Animated.Value(0)).current;

  const close = useCallback(() => {
    asyncTiming(pan, 0).then(() => onClose(id));
  }, [id, onClose, pan]);

  useEffect(() => {
    asyncTiming(pan, 1)
      .then(() => sleep(2000))
      .then(() => close());
  }, [close, pan]);

  return (
    <TouchableWithoutFeedback style={page.flex} onPress={close}>
      <Animated.View
        style={[
          page.container,
          {
            transform: [
              {
                translateY: pan.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                }),
              },
            ],
            opacity: pan,
          },
        ]}>
        <Paragraph p3 style={page.p3}>
          {message}
        </Paragraph>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const page = StyleSheet.create({
  container: {
    marginVertical: 4,
    minWidth: 200,
    maxWidth: Dimensions.get('window').width - 40,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: BG_1,
    borderRadius: 24,
    shadowColor: BG_9,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flex: {flex: 1},
  p3: {fontWeight: '600', color: TEXT_BASE_1, textAlign: 'center'},
});
