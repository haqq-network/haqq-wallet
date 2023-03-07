import React, {useMemo} from 'react';

import {Image, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {DashedLine} from '@app/components/dashed-line';
import {ISLMLogo} from '@app/components/islm-logo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  InfoBlock,
  Spacer,
  Text,
} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';
import {getHostnameFromUrl} from '@app/utils';

interface WalletConnectApprovalProps {
  event: WalletConnectApproveConnectionEvent;
  selectedWallet: Wallet;

  onSelectWalletPress(): void;

  onPressReject(): void;

  onPressApprove(): void;
}

export const WalletConnectApproval = ({
  event,
  selectedWallet,
  onSelectWalletPress,
  onPressReject,
  onPressApprove,
}: WalletConnectApprovalProps) => {
  const {bottom} = useSafeAreaInsets();
  const metadata = useMemo(() => event?.params?.proposer?.metadata, [event]);
  const imageSource = useMemo(() => ({uri: metadata.icons?.[0]}), [metadata]);
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  return (
    <View style={styles.container}>
      <View style={styles.selectAccount}>
        <Spacer height={32} />

        <Text
          t5
          i18n={I18N.walletConnectApprovalTitle}
          i18params={{name: metadata?.name}}
        />

        <Spacer height={8} />

        <Text t13 color={Color.textGreen1} children={url} />

        <Spacer height={36} />

        <View style={styles.islmLogosContainer}>
          <ISLMLogo border />
          <DashedLine width={26} style={styles.dashedLine} />
          <View style={styles.eventImageContainer}>
            <Image style={styles.eventImage} source={imageSource} />
          </View>
        </View>

        <Spacer height={36} />

        <WalletRow
          type={WalletRowTypes.variant2}
          item={selectedWallet}
          onPress={onSelectWalletPress}
        />

        <Spacer height={12} />

        <InfoBlock
          warning
          icon={<Icon name="info" color={Color.textYellow1} />}>
          <Text
            t13
            color={Color.textYellow1}
            i18n={I18N.walletConnectApprovalInfoBlockTitle}
          />
          <Text i18n={I18N.walletConnectApprovalInfoBlockDescription} />
        </InfoBlock>
      </View>

      <View style={[styles.buttonContainer, {marginBottom: bottom}]}>
        <Button
          size={ButtonSize.middle}
          variant={ButtonVariant.contained}
          onPress={onPressApprove}
          title="Connect"
        />

        <Spacer height={16} />

        <Button
          size={ButtonSize.middle}
          textColor={Color.textRed1}
          onPress={onPressReject}
          title="Reject"
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  selectAccount: {
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    flex: 1,
  },
  islmLogosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    marginHorizontal: 6,
  },
  eventImage: {
    width: 44,
    height: 44,
    borderRadius: 100,
  },
  eventImageContainer: {
    width: 44 + 15,
    height: 44 + 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Color.graphicBase2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
