import React, {useCallback, useEffect, useState} from 'react';
import {Container} from '../container';
import {Spacer} from '../spacer';
import {Title} from '../ui';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {NumericKeyboard} from '../numeric-keyboard';
import {GRAPHIC_BASE_4, TEXT_BASE_2, TEXT_GREEN_1} from '../../variables';
import {useApp} from '../../contexts/app';
import {RestorePassword} from '../restore-password';

export type PinModalProps = {};

export const PinModal = () => {
  const app = useApp();
  const [showRestore, setShowRestore] = useState(false);
  const [pin, setPin] = useState('');

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
    <View style={{backgroundColor: '#ffffff', flex: 1}}>
      <Container style={page.container}>
        <Spacer style={page.spacer}>
          <Title style={page.title}>Welcome to ISLM Wallet</Title>
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
        {showRestore && (
          <RestorePassword onClose={() => setShowRestore(false)} />
        )}
      </Container>
    </View>
  );
};

const page = StyleSheet.create({
  container: {alignItems: 'center'},
  spacer: {justifyContent: 'center', alignItems: 'center'},
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
  title: {marginBottom: 60},
});
