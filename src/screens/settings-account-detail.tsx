import React, {useCallback} from 'react';
import {
  Card,
  CardMask,
  Container,
  DataContent,
  MenuNavigationButton,
  Paragraph,
  Spacer,
} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {CompositeScreenProps} from '@react-navigation/native';
import {Dimensions, StyleSheet, Switch, View} from 'react-native';
import {BG_8, TEXT_BASE_1} from '../variables';
import prompt from 'react-native-prompt-android';
import {app} from '../contexts/app';

type SettingsAccountDetailScreenProps = CompositeScreenProps<any, any>;

const cardMaskWidth = Dimensions.get('window').width - 112;
const cardMaskHeight = cardMaskWidth * 0.547528517;

export const SettingsAccountDetailScreen = ({
  navigation,
  route,
}: SettingsAccountDetailScreenProps) => {
  const wallet = useWallet(route.params.address);

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
            if (wallet) {
              wallet.name = n;
            }
          },
        },
      ],
      {
        cancelable: false,
        defaultValue: wallet?.name,
      },
    );
  }, [wallet]);

  const onPressStyle = useCallback(() => {
    navigation.navigate('settingsAccountStyle', {
      address: route.params.address,
    });
  }, [navigation, route.params.address]);

  const onToggleIsHidden = useCallback(() => {
    if (wallet) {
      wallet.isHidden = !wallet.isHidden;

      if (wallet.isHidden) {
        app.emit('notification', 'The account was hidden');
      }
    }
  }, [wallet]);

  if (!wallet) {
    return null;
  }

  return (
    <Container>
      <View style={[page.header, wallet.isHidden && page.opacity]}>
        <Card
          width={Dimensions.get('window').width - 72}
          style={page.card}
          pattern={wallet.pattern}
          colorFrom={wallet.colorFrom}
          colorTo={wallet.colorTo}
          colorPattern={wallet.colorPattern}>
          <CardMask
            style={[
              page.cardMask,
              {width: cardMaskWidth, height: cardMaskHeight},
            ]}
          />
        </Card>
        <Paragraph style={page.headerName}>{wallet.name}</Paragraph>
        <Paragraph h3 style={page.headerAddress}>
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
        <Switch value={wallet.isHidden} onChange={onToggleIsHidden} />
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
  opacity: {opacity: 0.5},
  cardMask: {margin: 4},
});
