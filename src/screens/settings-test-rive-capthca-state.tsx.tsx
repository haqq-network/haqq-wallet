/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef} from 'react';

import {SafeAreaView, ScrollView, View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {RiveRef} from 'rive-react-native';

import {WINDOW_HEIGHT} from '@app/variables/common';

import {Button, ButtonVariant, Spacer, Text} from '../components/ui';
import {RiveWrapper} from '../components/ui/rive-wrapper';

const Title = ({text = ''}) => (
  <>
    <Spacer height={10} />
    <Text t10 children={text} />
    <Spacer height={5} />
  </>
);

export const SettingsTestRiveCapthcaState = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const riveRef = useRef<RiveRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [logs, setLogs] = React.useState<string[]>([]);
  const addLog = (text: string) => {
    setLogs(state => [...state, text]);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 20,
        }}>
        <View style={{width: '100%', height: WINDOW_HEIGHT * 0.2}}>
          <RiveWrapper
            ref={riveRef}
            width={80}
            height={50}
            resourceName="captcha_state"
            enableClickToAnimation
            onPlay={(animationName, isStateMachine) => {
              addLog(
                `${new Date().toLocaleTimeString()} [onPlay] ${JSON.stringify(
                  {animationName, isStateMachine},
                  null,
                  2,
                )}`,
              );
            }}
            onPause={(animationName, isStateMachine) => {
              addLog(
                `${new Date().toLocaleTimeString()} [onPause] ${JSON.stringify(
                  {animationName, isStateMachine},
                  null,
                  2,
                )}`,
              );
            }}
            onStop={(animationName, isStateMachine) => {
              addLog(
                `${new Date().toLocaleTimeString()} [onStop] ${JSON.stringify(
                  {animationName, isStateMachine},
                  null,
                  2,
                )}`,
              );
            }}
            onLoopEnd={(animationName, loopMode) => {
              addLog(
                `${new Date().toLocaleTimeString()} [onLoopEnd] ${JSON.stringify(
                  {animationName, loopMode},
                  null,
                  2,
                )}`,
              );
            }}
            onStateChanged={(stateMachineName, stateName) => {
              addLog(
                `${new Date().toLocaleTimeString()} [onStateChanged] ${JSON.stringify(
                  {stateMachineName, stateName},
                  null,
                  2,
                )}`,
              );
            }}
            onError={rnRiveError => {
              addLog(
                `🔴 ${new Date().toLocaleTimeString()} [onError] ${JSON.stringify(
                  {rnRiveError},
                  null,
                  2,
                )}`,
              );
            }}
          />
        </View>
        <Spacer height={10} />
        <View
          style={{
            height: WINDOW_HEIGHT * 0.3,
            borderWidth: 1,
            borderRadius: 12,
            width: '100%',
            padding: 5,
          }}>
          <ScrollView
            ref={scrollRef}
            onContentSizeChange={() => {
              scrollRef.current?.scrollToEnd();
            }}
            style={{width: '100%', height: '100%'}}>
            {logs.map((log, idx) => (
              <Text key={log + idx}>{log}</Text>
            ))}
          </ScrollView>
        </View>
        <Spacer height={10} />
        <View style={{flex: 1, width: '100%'}}>
          <ScrollView style={{flex: 1}}>
            <Title text="Animations" />
            <Button
              variant={ButtonVariant.contained}
              title="Timeline 1"
              onPress={() => {
                riveRef.current?.play('Timeline 1');
              }}
            />
            <Spacer height={10} />
            <Button
              variant={ButtonVariant.contained}
              title="Timeline 2"
              onPress={() => {
                riveRef.current?.play('Timeline 2');
              }}
            />
            <Spacer height={10} />
            <Button
              variant={ButtonVariant.contained}
              title="Timeline 3"
              onPress={() => {
                riveRef.current?.play('Timeline 3');
              }}
            />
            <Title text="fireState: State machine 1" />
            <Button
              variant={ButtonVariant.contained}
              title="Good"
              onPress={() => {
                riveRef.current?.fireState?.('State Machine 1', 'Good');
              }}
            />
            <Spacer height={10} />
            <Button
              variant={ButtonVariant.contained}
              title="Bad"
              onPress={() => {
                riveRef.current?.fireState?.('State Machine 1', 'Bad');
              }}
            />
            <Title text="Controls" />
            <Button
              variant={ButtonVariant.contained}
              title="Play"
              onPress={() => {
                riveRef.current?.play();
              }}
            />
            <Spacer height={10} />
            <Button
              variant={ButtonVariant.contained}
              title="Pause"
              onPress={() => {
                riveRef.current?.pause();
              }}
            />
            <Spacer height={10} />
            <Button
              variant={ButtonVariant.contained}
              title="Stop"
              onPress={() => {
                riveRef.current?.stop();
              }}
            />
            <Spacer height={10} />
            <Button
              variant={ButtonVariant.contained}
              title="Reset"
              onPress={() => {
                setLogs([]);
                riveRef.current?.reset();
              }}
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};
