import React, {useMemo} from 'react';
import {Text} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {Button} from '../components/ui';
import {Spacer} from '../components/spacer';
import {useWallets} from '../contexts/wallets';

type BackupCreateScreenProp = CompositeScreenProps<any, any>;

export const BackupCreateScreen = ({
  navigation,
  route,
}: BackupCreateScreenProp) => {
  const wallets = useWallets();
  const wallet = useMemo(
    () => wallets.getWallet(route.params.address),
    [route.params.address, wallets],
  );

  return (
    <Container>
      <Spacer>
        <Text>{wallet?.wallet.mnemonic.phrase}</Text>
      </Spacer>
      <Button
        title="Go next"
        onPress={() =>
          navigation.navigate('backupVerify', {address: route.params.address})
        }
      />
    </Container>
  );
};
