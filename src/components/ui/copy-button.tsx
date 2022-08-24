import React, {useCallback, useMemo, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Container} from '../container';
import {CopyConfirmation} from './svg-icon';
import {GRAPHIC_BASE_2} from '../../variables';

export type CopyButtonProps = TouchableOpacityProps & {
  value: string;
};

export const CopyButton = ({
  children,
  value,
  style,
  ...props
}: CopyButtonProps) => {
  const [showNotification, setSShowNotification] = useState(false);
  const onPress = useCallback(() => {
    Clipboard.setString(value);
    setSShowNotification(true);
    setTimeout(() => {
      setSShowNotification(false);
    }, 5000);
  }, [value]);

  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <>
      <TouchableOpacity onPress={onPress} style={containerStyle} {...props}>
        {children}
      </TouchableOpacity>
      <Modal animationType="fade" visible={showNotification} transparent={true}>
        <Container>
          <TouchableOpacity
            onPress={() => setSShowNotification(false)}
            style={page.overlay}>
            <View style={page.background}>
              <CopyConfirmation color={GRAPHIC_BASE_2} style={page.icon} />
              <Text style={page.text}>Copied</Text>
            </View>
          </TouchableOpacity>
        </Container>
      </Modal>
    </>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlay: {justifyContent: 'center', alignItems: 'center', flex: 1},
  background: {
    backgroundColor: 'rgba(229, 229, 234, 0.82)',
    width: 155,
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  icon: {marginBottom: 19},
  text: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
    letterSpacing: -0.32,
  },
});
