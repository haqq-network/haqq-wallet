import React, {useCallback, useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../contexts/app';
import {Container} from '../components/container';
import {Title} from '../components/ui';
import {Spacer} from '../components/spacer';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {GRAPHIC_BASE_4, TEXT_GREEN_1} from '../variables';

type SplashScreenProp = {
  visible: boolean;
};

export const SplashScreen = ({visible}: SplashScreenProp) => {
  const app = useApp();
  const [showPin, setShowPin] = useState(false);

  const [pin, setPin] = useState('');

  const modalVisible = visible || showPin;

  useEffect(() => {
    const subscription = (state: boolean) => {
      if (state !== showPin) {
        setPin('');
        setShowPin(state);
      }
    };

    app.on('showPin', subscription);

    return () => {
      app.off('showPin', subscription);
    };
  }, [app, showPin]);

  const onKeyboard = useCallback((value: number) => {
    if (value > -1) {
      setPin(p => `${p}${value}`);
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      app
        .comparePin(pin)
        .then(() => {
          requestAnimationFrame(() => app.emit('enterPin', pin));
        })
        .catch(() => {
          setPin('');
        });
    }
  }, [pin, app]);

  return (
    <Modal animationType="fade" visible={modalVisible}>
      {showPin ? (
        <Container style={{alignItems: 'center'}}>
          <Title>Enter 6-digital pin code</Title>
          <Spacer style={{justifyContent: 'center', alignItems: 'center'}}>
            <View style={page.dots}>
              <View style={[page.dot, pin.length >= 1 && page.active]} />
              <View style={[page.dot, pin.length >= 2 && page.active]} />
              <View style={[page.dot, pin.length >= 3 && page.active]} />
              <View style={[page.dot, pin.length >= 4 && page.active]} />
              <View style={[page.dot, pin.length >= 5 && page.active]} />
              <View style={[page.dot, pin.length >= 6 && page.active]} />
            </View>
          </Spacer>
          <NumericKeyboard onPress={onKeyboard} />
        </Container>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#04D484',
          }}>
          <Text>Splash Screen</Text>
        </View>
      )}
    </Modal>
  );
};

const page = StyleSheet.create({
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: GRAPHIC_BASE_4,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: TEXT_GREEN_1,
    transform: [{scale: 1}],
  },
});
