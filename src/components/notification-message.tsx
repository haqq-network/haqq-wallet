import React, {useCallback, useEffect, useRef} from 'react';

import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {asyncTiming, sleep} from '@app/utils';
import {SHADOW_COLOR_2} from '@app/variables/common';

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
    <TouchableWithoutFeedback style={styles.flex} onPress={close}>
      <Animated.View
        style={[
          styles.container,
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
        <Text t14 center>
          {message}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: Dimensions.get('window').width - 40,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Color.bg1,
    borderRadius: 24,
    shadowColor: SHADOW_COLOR_2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flex: {alignSelf: 'stretch'},
});
