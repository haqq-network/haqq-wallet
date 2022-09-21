import React, {useCallback, useState} from 'react';
import {
  Card,
  CardMask,
  Container,
  DataContent,
  MenuNavigationButton,
  Paragraph,
  ParagraphSize,
  Spacer,
} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {CompositeScreenProps} from '@react-navigation/native';
import {Dimensions, StyleSheet, Switch, View} from 'react-native';
import {BG_8, TEXT_BASE_1, TEXT_BASE_2} from '../variables';
import prompt from 'react-native-prompt-android';

type SettingsAccountDetailScreenProps = CompositeScreenProps<any, any>;

const cardMaskWidth = Dimensions.get('window').width - 112;
const cardMaskHeight = cardMaskWidth * 0.547528517;

export const SettingsAccountDetailScreen = ({
  navigation,
  route,
}: SettingsAccountDetailScreenProps) => {
  const wallet = useWallet(route.params.address);
  const [isHidden, setIsHidden] = useState(wallet?.isHidden);
  const [name, setName] = useState(wallet?.name ?? '');

  const onPressRename = useCallback(() => {
    prompt(
      'Edit account name',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: n => {
            wallet?.updateWallet({name: n});
            setName(n);
          },
        },
      ],
      {
        cancelable: false,
        defaultValue: wallet?.name,
      },
    );
  }, [wallet?.name]);

  const onPressStyle = useCallback(() => {
    navigation.navigate('settingsAccountStyle', {
      address: route.params.address,
    });
  }, [navigation, route.params.address]);

  const onToggleIsHidden = useCallback(() => {
    wallet?.updateWallet({isHidden: !wallet?.isHidden});
    setIsHidden(wallet?.isHidden);
  }, [wallet]);

  if (!wallet) {
    return null;
  }

  return (
    <Container>
      <View style={[page.header, wallet.isHidden && {opacity: 0.5}]}>
        <Card
          width={Dimensions.get('window').width - 72}
          style={page.card}
          variant={wallet.cardStyle}>
          <CardMask
            style={{width: cardMaskWidth, height: cardMaskHeight, margin: 4}}
          />
        </Card>
        <Paragraph style={page.headerName}>{name}</Paragraph>
        <Paragraph size={ParagraphSize.s} style={page.headerAddress}>
          {wallet?.address}
        </Paragraph>
      </View>
      <MenuNavigationButton onPress={onPressRename}>
        <DataContent
          title="Rename account"
          subtitle="Change the account display name"
        />
      </MenuNavigationButton>
      <MenuNavigationButton onPress={onPressStyle}>
        <DataContent
          title="Change style"
          subtitle="Change the picture of the account"
        />
      </MenuNavigationButton>
      <MenuNavigationButton onPress={onPressRename} hideArrow>
        <DataContent
          title="Hide account"
          subtitle="Will be hidden from the general list"
        />
        <Spacer />
        <Switch value={isHidden} onChange={onToggleIsHidden} />
      </MenuNavigationButton>
    </Container>
  );
};

const page = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    backgroundColor: BG_8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  headerName: {
    fontWeight: '600',
    color: TEXT_BASE_1,
    marginBottom: 4,
  },
  headerAddress: {
    color: TEXT_BASE_1,
  },
  subtitle: {
    color: TEXT_BASE_2,
  },
  title: {
    color: TEXT_BASE_1,
    marginBottom: 2,
  },
});
