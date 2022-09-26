import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Paragraph, ParagraphSize} from './ui';
import {TEXT_BASE_1} from '../variables';
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
    <TouchableWithoutFeedback style={{flex: 1}} onPress={close}>
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
        <Paragraph
          size={ParagraphSize.s}
          style={{fontWeight: '600', color: TEXT_BASE_1, textAlign: 'center'}}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
