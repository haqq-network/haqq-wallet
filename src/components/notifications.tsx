import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {NotificationMessage} from './notification-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../contexts/app';
import {generateUUID} from '../utils';

export const Notifications = () => {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const subscription = (message: string) => {
      setMessages(msgs => msgs.concat({message, id: generateUUID()}));
    };

    app.on('notification', subscription);

    return () => {
      app.off('notification', subscription);
    };
  }, [app]);

  const onClose = useCallback((id: string) => {
    setMessages(msgs => msgs.filter(msg => msg.id !== id));
  }, []);

  return (
    <View
      pointerEvents="none"
      style={[page.container, {paddingTop: insets.top}]}>
      {messages.map(({message, id}) => (
        <NotificationMessage
          message={message}
          id={id}
          onClose={onClose}
          key={id}
        />
      ))}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
