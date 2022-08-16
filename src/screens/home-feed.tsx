import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, Modal} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {WalletCard} from '../components/wallet-card';
import {Container} from '../components/container';
import {utils} from 'ethers';
import {BackupScreen} from './backup-anim';

type HomeFeedScreenProp = CompositeScreenProps<any, any>;

export const HomeFeedScreen = ({navigation}: HomeFeedScreenProp) => {
  const wallet = useWallets();
  const [wallets, setWallets] = useState(wallet.getWallets());
  const [modalVisible, setModalVisible] = useState(false);

  const updateWallets = useCallback(() => {
    setWallets(wallet.getWallets());
  }, [wallet]);

  const onPressCreateWallet = useCallback(() => {
    const bytes = utils.randomBytes(16);
    console.log(bytes);
    wallet
      .addWalletFromMnemonic(utils.entropyToMnemonic(bytes), 'Main account')
      .then(() => {
        console.log('done');
      });
  }, []);

  useEffect(() => {
    wallet.on('wallets', updateWallets);

    return () => {
      wallet.off('wallets', updateWallets);
    };
  }, [updateWallets, wallet]);

  return (
    <Container>
      {wallets.map(w => (
        <WalletCard wallet={w} key={w.address} />
      ))}
      <Button title="create wallet" onPress={onPressCreateWallet} />
      <Button title="show modal" onPress={() => setModalVisible(true)} />
      <Button
        title="Import wallet"
        onPress={() => navigation.navigate('import-wallet')}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <BackupScreen
          onClose={() => {
            setModalVisible(false);
          }}
        />
      </Modal>
    </Container>
  );
};
