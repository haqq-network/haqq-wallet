import {Modal, View} from 'react-native';
import {Title, Waiting} from '../components/ui';
import {TEXT_BASE_3} from '../variables';
import React, {useEffect, useState} from 'react';
import {useApp} from '../contexts/app';

export const Loading = () => {
  const app = useApp();
  const [modal, setModal] = useState<null | {text: string}>(null);

  useEffect(() => {
    const subscription = (params: {text: string} | null) => {
      setModal(params);
    };
    app.on('loading', subscription);

    return () => {
      app.off('loading', subscription);
    };
  }, [app]);

  return (
    <Modal visible={!!modal} animationType="fade">
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: '#04D484',
        }}>
        <Waiting style={{marginBottom: 40}} />
        {modal?.text && (
          <Title style={{color: TEXT_BASE_3}}>{modal.text}</Title>
        )}
      </View>
    </Modal>
  );
};
