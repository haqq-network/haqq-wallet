import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Dimensions, StyleSheet, Switch, View} from 'react-native';
import prompt from 'react-native-prompt-android';

import {
  Card,
  CardMask,
  DataContent,
  MenuNavigationButton,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {app} from '../contexts/app';
import {useWallet} from '../contexts/wallets';
import {RootStackParamList} from '../types';
import {LIGHT_BG_8} from '../variables';

const cardWidth = Dimensions.get('window').width - 72;
const cardMaskWidth = Dimensions.get('window').width - 112;
const cardMaskHeight = cardMaskWidth * 0.547528517;

export const SettingsAccountDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'settingsAccountDetail'>>();

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
    <PopupContainer style={page.container}>
      <View style={[page.header, wallet.isHidden && page.opacity]}>
        <Card
          width={cardWidth}
          height={cardMaskHeight + 40}
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
        <Text t10 style={page.headerName}>
          {wallet.name}
        </Text>
        <Text t14>{wallet?.address}</Text>
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
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    marginTop: 15,
    backgroundColor: LIGHT_BG_8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerName: {
    marginBottom: 4,
  },
  cardMask: {margin: 4},
  opacity: {opacity: 0.5},
});
