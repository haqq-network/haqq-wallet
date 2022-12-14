import React, {useCallback, useEffect, useState} from 'react';

import {Modal, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NotificationMessage} from '@app/components/notification-message';
import {useApp} from '@app/hooks';
import {generateUUID} from '@app/utils';

export const Notifications = () => {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<{message: string; id: string}[]>([]);
  const [overlap, setOverlap] = useState(false);

  useEffect(() => {
    const subscription = (message: string, isOverlap = false) => {
      setOverlap(isOverlap);
      setMessages(msgs =>
        msgs.concat({message, id: generateUUID()}).slice(isOverlap ? -1 : -2),
      );
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
      style={[styles.container, {paddingTop: insets.top}]}>
      {messages.map(({message, id}) =>
        overlap ? (
          <Modal key={id} animationType="none" visible transparent>
            <View style={styles.modal}>
              <NotificationMessage
                message={message}
                id={id}
                onClose={onClose}
              />
            </View>
          </Modal>
        ) : (
          <NotificationMessage
            message={message}
            id={id}
            onClose={onClose}
            key={id}
          />
        ),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  modal: {
    alignItems: 'center',
    width: '100%',
  },
});
