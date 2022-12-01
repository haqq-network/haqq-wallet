import React, {useCallback} from 'react';

import {Dimensions, Switch, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Card,
  CardMask,
  DataContent,
  MenuNavigationButton,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, sendNotification} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {I18N} from '@app/i18n';

const cardWidth = Dimensions.get('window').width - 72;
const cardMaskWidth = Dimensions.get('window').width - 112;
const cardMaskHeight = cardMaskWidth * 0.547528517;

export const SettingsAccountDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'settingsAccountDetail'>();

  const wallet = useWallet(route.params.address);

  const onPressRename = useCallback(() => {
    navigation.navigate('settingsAccountEdit', route.params);
  }, [navigation, route.params]);

  const onPressStyle = useCallback(() => {
    navigation.navigate('settingsAccountStyle', {
      address: route.params.address,
    });
  }, [navigation, route.params.address]);

  const onToggleIsHidden = useCallback(() => {
    if (wallet) {
      wallet.isHidden = !wallet.isHidden;

      if (wallet.isHidden) {
        sendNotification(I18N.notificationAccountHidden);
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

const page = createTheme({
  container: {
    marginHorizontal: 20,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    marginTop: 15,
    backgroundColor: Color.bg8,
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
