import React, {useMemo} from 'react';

import {Switch, View} from 'react-native';

import {Color} from '@app/colors';
import {AddressInfo} from '@app/components/address-info/address-info';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardMask,
  DataContent,
  First,
  Icon,
  InfoBlock,
  MenuNavigationButton,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

type SettingsAccountDetailProps = {
  wallet: Wallet;
  onPressRename: () => void;
  onPressStyle: () => void;
  onToggleIsHidden: () => void;
  onViewingRecoveryPhrase: () => void;
  onPressPhrase(): void;
  onPressSocial(): void;
};
const CONTAINER_MARGIN = 20;
const CARD_PADDING = 16;
const CARD_ASPECT_RATIO = 0.6336633663; // height / width from figma
const CARD_MASK_ASPECT_RATIO = 0.547528517; // height / width from figma
const CARD_MASK_PADDING = 20;

export const SettingsAccountDetail = ({
  wallet,
  onPressRename,
  onPressStyle,
  onToggleIsHidden,
  onViewingRecoveryPhrase,
  onPressPhrase,
  onPressSocial,
}: SettingsAccountDetailProps) => {
  const cardWidth = useCalculatedDimensionsValue(
    ({width}) => width - CONTAINER_MARGIN * 2 - CARD_PADDING * 2,
  );
  const cardHeight = useMemo(() => cardWidth * CARD_ASPECT_RATIO, [cardWidth]);
  const cardMaskWidth = useMemo(
    () => cardWidth - CARD_MASK_PADDING * 2,
    [cardWidth],
  );
  const cardMaskHeight = useMemo(
    () => cardMaskWidth * CARD_MASK_ASPECT_RATIO,
    [cardMaskWidth],
  );

  return (
    <PopupContainer style={styles.container}>
      <View style={[styles.header, wallet.isHidden && styles.opacity]}>
        <Card
          width={cardWidth}
          height={cardHeight}
          style={styles.card}
          pattern={wallet.pattern}
          colorFrom={wallet.colorFrom}
          colorTo={wallet.colorTo}
          colorPattern={wallet.colorPattern}>
          <CardMask
            style={[
              styles.cardMask,
              {width: cardMaskWidth, height: cardMaskHeight},
            ]}
          />
        </Card>
        <Text t10 style={styles.headerName}>
          {wallet.name}
        </Text>
        <AddressInfo copyValue={wallet?.address}>
          <Text t14>{wallet?.address}</Text>
        </AddressInfo>
        <View style={styles.hDevider} />
        <AddressInfo copyValue={AddressUtils.toHaqq(wallet?.address)}>
          <Text t14 color={Color.textBase2}>
            {`${getText(I18N.bech32Title)}: `}
          </Text>
          <Text t14>{AddressUtils.toHaqq(wallet?.address)}</Text>
        </AddressInfo>
      </View>
      {isFeatureEnabled(Feature.sss) && (
        <First>
          {!wallet.mnemonicSaved && wallet.type === WalletType.mnemonic && (
            <InfoBlock
              testID="recovery_warning"
              border
              warning
              icon={<Icon name={'warning'} color={Color.textYellow1} />}
              i18n={I18N.settingsAccountDetailRecoveryWarning}
              bottomContainerStyle={styles.row}
              bottom={
                <>
                  <Button
                    style={styles.button}
                    size={ButtonSize.small}
                    i18n={I18N.settingsAccountDetailPhrase}
                    variant={ButtonVariant.second}
                    onPress={onPressPhrase}
                    testID="recovery_phrase"
                    disabled={wallet.mnemonicSaved}
                  />
                  <Spacer width={10} />
                  <Button
                    style={styles.button}
                    size={ButtonSize.small}
                    i18n={I18N.settingsAccountDetailSocial}
                    variant={ButtonVariant.second}
                    onPress={onPressSocial}
                    disabled={wallet.socialLinkEnabled}
                  />
                </>
              }
            />
          )}
          {wallet.type === WalletType.mnemonic && !wallet.mnemonicSaved && (
            <InfoBlock
              border
              icon={<Icon name={'warning'} color={Color.graphicBase1} />}
              i18n={I18N.settingsAccountDetailRecoverySocialWarning}
              bottomContainerStyle={styles.row}
              bottom={
                <>
                  <Button
                    style={styles.button}
                    size={ButtonSize.small}
                    i18n={I18N.settingsAccountDetailConnectSocialLogin}
                    variant={ButtonVariant.second}
                    onPress={onPressSocial}
                  />
                </>
              }
            />
          )}
          {!wallet.mnemonicSaved && (
            <InfoBlock
              border
              icon={<Icon name={'warning'} color={Color.graphicBase1} />}
              i18n={I18N.settingsAccountDetailRecoveryPhraseWarning}
              bottomContainerStyle={styles.row}
              bottom={
                <>
                  <Button
                    style={styles.button}
                    size={ButtonSize.small}
                    i18n={I18N.settingsAccountDetailCreateBackupPhrase}
                    variant={ButtonVariant.second}
                    onPress={onPressPhrase}
                    disabled={wallet.mnemonicSaved}
                  />
                </>
              }
            />
          )}
        </First>
      )}
      <MenuNavigationButton onPress={onPressRename}>
        <DataContent
          titleI18n={I18N.settingsAccountDetailRenameTitle}
          subtitleI18n={I18N.settingsAccountDetailRenameSubtitle}
        />
      </MenuNavigationButton>
      <MenuNavigationButton onPress={onPressStyle}>
        <DataContent
          titleI18n={I18N.settingsAccountDetailChangeStyleTitle}
          subtitleI18n={I18N.settingsAccountDetailChangeStyleSubtitle}
        />
      </MenuNavigationButton>
      {(wallet.type === WalletType.mnemonic ||
        wallet.type === WalletType.sss) &&
        wallet.accountId && (
          <MenuNavigationButton
            testID="view_recovery_phrase"
            onPress={onViewingRecoveryPhrase}>
            <DataContent
              titleI18n={I18N.settingsAccountDetailViewRecoveryPhraseTitle}
              subtitleI18n={
                I18N.settingsAccountDetailViewRecoveryPhraseSubtitle
              }
            />
          </MenuNavigationButton>
        )}
      <MenuNavigationButton hideArrow>
        <DataContent
          titleI18n={I18N.settingsAccountDetailHideTitle}
          subtitleI18n={I18N.settingsAccountDetailHideSubtitle}
        />
        <Spacer />
        <Switch value={wallet.isHidden} onChange={onToggleIsHidden} />
      </MenuNavigationButton>
    </PopupContainer>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
  },
  container: {
    marginHorizontal: CONTAINER_MARGIN,
  },
  header: {
    marginTop: 15,
    backgroundColor: Color.bg8,
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 10,
  },
  headerName: {
    marginBottom: 4,
  },
  cardMask: {
    margin: 4,
  },
  opacity: {opacity: 0.5},
  hDevider: {
    height: 8,
  },
});
