import React, {useCallback, useMemo, useRef, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {Share, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import {BottomSheet} from '@app/components/bottom-sheet';
import {
  TopTabNavigator,
  TopTabNavigatorVariant,
} from '@app/components/top-tab-navigator';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  Icon,
  InfoBlock,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {Color} from '@app/theme';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

enum TabNames {
  evm = 'evm',
  bech32 = 'bech32',
}

export interface DetailsQrModalProps {
  wallet: Wallet;
  onClose: () => void;
}

export const AccountDetail = ({wallet, onClose}: DetailsQrModalProps) => {
  const svg = useRef();
  const {width} = useWindowDimensions();

  const [activeTab, setActiveTab] = useState(TabNames.evm);
  const address = useMemo(
    () => (activeTab === TabNames.evm ? wallet.address : wallet.cosmosAddress),
    [activeTab, wallet.address],
  );

  const onCopy = useCallback(() => {
    Clipboard.setString(address);
    sendNotification(I18N.notificationCopied);
  }, [address]);

  const onShare = useCallback(() => {
    Share.share({message: address});
  }, [address]);

  const onTabChange = useCallback((tabName: TabNames) => {
    setActiveTab(tabName);
  }, []);

  return (
    <BottomSheet onClose={onClose} i18nTitle={I18N.modalDetailsQRReceive}>
      <View style={styles.tabs}>
        <TopTabNavigator
          contentContainerStyle={styles.tabsContentContainerStyle}
          tabHeaderStyle={styles.tabHeaderStyle}
          variant={TopTabNavigatorVariant.large}
          onTabChange={onTabChange}>
          <TopTabNavigator.Tab
            name={TabNames.evm}
            title={I18N.evmTitle}
            component={null}
          />
          <TopTabNavigator.Tab
            name={TabNames.bech32}
            title={I18N.bech32Title}
            component={null}
          />
        </TopTabNavigator>
      </View>
      <InfoBlock
        warning
        style={styles.info}
        i18n={I18N.modalDetailsQRWarning}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <LinearGradient
        colors={[wallet?.colorFrom, wallet?.colorTo]}
        style={styles.qrContainer}
        start={GRADIENT_START}
        end={GRADIENT_END}>
        <View style={styles.card}>
          <Card
            transparent
            width={width - 113}
            pattern={wallet?.pattern}
            colorFrom={wallet?.colorFrom}
            colorTo={wallet?.colorTo}
            colorPattern={wallet?.colorPattern}
          />
        </View>
        <View style={styles.qrStyle}>
          <QRCode
            ecl={'H'}
            logo={require('@assets/images/qr-logo.png')}
            value={`haqq:${address}`}
            size={width - 169}
            getRef={c => (svg.current = c)}
            logoSize={width / 5.86}
            logoBorderRadius={8}
          />
        </View>
        <Text t14 style={styles.title}>
          {wallet?.name}
        </Text>
        <Text t10 style={styles.address}>
          {address}
        </Text>
      </LinearGradient>

      <View style={styles.buttons}>
        <Button
          i18n={I18N.share}
          size={ButtonSize.middle}
          onPress={onShare}
          style={styles.button}
        />
        <Button
          size={ButtonSize.middle}
          style={styles.button}
          variant={ButtonVariant.second}
          i18n={I18N.copy}
          onPress={onCopy}
        />
      </View>
    </BottomSheet>
  );
};

const styles = createTheme({
  qrContainer: {
    position: 'relative',
    marginHorizontal: 36.5,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    color: Color.textSecond2,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: Color.textBase3,
    marginBottom: 4,
  },
  tabs: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    flex: 1,
  },
  info: {marginBottom: 16},
  card: {position: 'absolute', bottom: 0, left: 0, right: 0},
  qrStyle: {
    padding: 12,
    backgroundColor: Color.graphicBase3,
    borderRadius: 12,
    marginBottom: 20,
  },
  tabsContentContainerStyle: {
    flex: 1,
  },
  tabHeaderStyle: {
    marginHorizontal: 20,
  },
});
