import React, {useEffect, useState} from 'react';
import {Modal, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {Title, Waiting} from '../components/ui';
import {TEXT_BASE_3} from '../variables';

type OnboardingStoreWalletScreenProp = CompositeScreenProps<any, any>;

export const OnboardingStoreWalletScreen = ({
  navigation,
  route,
}: OnboardingStoreWalletScreenProp) => {
  const [modal, setModal] = useState(true);
  const wallets = useWallets();

  useEffect(() => {
    requestAnimationFrame(() => {
      const actions = wallets
        .getWallets()
        .filter(w => !w.saved)
        .map(w => wallets.saveWallet(w));

      actions.push(
        new Promise(resolve => {
          setTimeout(() => resolve(), 4000);
        }),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate('onboarding-finish');
        })
        .finally(() => {
          setModal(false);
        });
    });
  }, [navigation, route.params.action, wallets]);

  const title =
    route.params.action === 'create'
      ? 'Creating a wallet'
      : 'Wallet recovery in progress';

  return (
    <Modal visible={modal} animationType="none">
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: '#04D484',
        }}>
        <Waiting style={{marginBottom: 40}} />
        <Title style={{color: TEXT_BASE_3}}>{title}</Title>
      </View>
    </Modal>
  );
};
