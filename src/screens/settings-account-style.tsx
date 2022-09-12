import React, {useMemo} from 'react';
import {Container} from '../components/container';
import {useWallets} from '../contexts/wallets';
import {CompositeScreenProps} from '@react-navigation/native';
import {StyleSheet} from 'react-native';

type SettingsAccountStyleScreenProps = CompositeScreenProps<any, any>;

export const SettingsAccountStyleScreen = ({
  navigation,
  route,
}: SettingsAccountStyleScreenProps) => {
  const wallets = useWallets();
  const _wallet = useMemo(
    () => wallets.getWallet(route.params.address),
    [wallets, route.params.address],
  );
  return <Container />;
};

const page = StyleSheet.create({});
