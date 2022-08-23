import React, {useCallback, useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {useApp} from '../contexts/app';
import {Container} from '../components/container';
import {Title} from '../components/ui';
import {Spacer} from '../components/spacer';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {GRAPHIC_BASE_4, TEXT_BASE_2, TEXT_GREEN_1} from '../variables';
import {RestorePassword} from '../components/restore-password';

type SplashScreenProp = {
  visible: boolean;
};

export const SplashScreen = ({visible}: SplashScreenProp) => {
  const app = useApp();
  const [showPin, setShowPin] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

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
    Vibration.vibrate();
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
          <Spacer style={{justifyContent: 'center', alignItems: 'center'}}>
            <Title style={{marginBottom: 60}}>Welcome to ISLM Wallet</Title>
            <View style={page.dots}>
              <View style={[page.dot, pin.length >= 1 && page.active]} />
              <View style={[page.dot, pin.length >= 2 && page.active]} />
              <View style={[page.dot, pin.length >= 3 && page.active]} />
              <View style={[page.dot, pin.length >= 4 && page.active]} />
              <View style={[page.dot, pin.length >= 5 && page.active]} />
              <View style={[page.dot, pin.length >= 6 && page.active]} />
            </View>
          </Spacer>
          <NumericKeyboard
            onPress={onKeyboard}
            additionButton={
              <TouchableOpacity
                style={page.additionButton}
                onPress={() => setShowRestore(true)}>
                <Text style={page.additionButtonText}>Forgot</Text>
                <Text style={page.additionButtonText}>the code</Text>
              </TouchableOpacity>
            }
          />
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
      {showRestore && <RestorePassword onClose={() => setShowRestore(false)} />}
    </Modal>
  );
};

const page = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
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
  additionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionButtonText: {
    color: TEXT_BASE_2,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    padding: 2,
  },
});
