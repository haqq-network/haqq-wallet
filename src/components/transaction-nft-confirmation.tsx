import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  Icon,
  IconsName,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {NftItem} from '@app/models/nft';
import {splitAddress} from '@app/utils';

interface TransactionConfirmationProps {
  to: string;
  soulboundTokenHint: string;
  item: NftItem;
  contact: Contact | null;
  disabled?: boolean;
  onConfirmTransaction: () => void;
  onFeePress: () => void;
}

export const TransactionNftConfirmation = observer(
  ({
    disabled,
    contact,
    to,
    item,
    onConfirmTransaction,
    onFeePress,
    soulboundTokenHint,
  }: TransactionConfirmationProps) => {
    const splittedTo = useMemo(() => splitAddress(to), [to]);
    const imageUri = useNftImage(item.cached_url);

    return (
      <PopupContainer style={styles.container}>
        <Image
          source={imageUri}
          style={styles.icon}
          borderRadius={12}
          resizeMode="contain"
        />
        <Text variant={TextVariant.t5} position={TextPosition.center}>
          {item.name}
        </Text>
        <Spacer height={16} />
        <Text
          variant={TextVariant.t11}
          color={Color.textBase2}
          position={TextPosition.center}
          style={styles.subtitle}
          i18n={I18N.transactionConfirmationSendTo}
        />
        {contact && (
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            position={TextPosition.center}
            style={styles.contact}>
            {contact.name}
          </Text>
        )}
        <Text
          variant={TextVariant.t11}
          color={Color.textBase1}
          position={TextPosition.center}
          style={styles.address}>
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            position={TextPosition.center}
            style={styles.address}>
            {splittedTo[0]}
          </Text>
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {splittedTo[1]}
          </Text>
          <Text variant={TextVariant.t11}>{splittedTo[2]}</Text>
        </Text>
        {Boolean(soulboundTokenHint) && (
          <>
            <View style={styles.info}>
              <DataView
                style={styles.soulboundTokenHint}
                labelStyles={styles.soulboundTokenHintLabel}
                label={soulboundTokenHint}
              />
            </View>
            <Spacer />
          </>
        )}
        {Fee.expectedFee && (
          <View style={styles.info}>
            <DataView label={soulboundTokenHint || 'Network Fee'}>
              {!Fee.calculatedFees ? (
                <Text variant={TextVariant.t11} color={Color.textBase1}>
                  {getText(I18N.estimatingGas)}
                </Text>
              ) : (
                <View style={styles.feeContainer}>
                  <Text
                    variant={TextVariant.t11}
                    color={Color.textGreen1}
                    onPress={onFeePress}>
                    {Fee.expectedFeeString}
                  </Text>
                  <Icon name={IconsName.tune} color={Color.textGreen1} />
                </View>
              )}
            </DataView>
          </View>
        )}
        <Spacer />
        <Button
          disabled={
            (!Fee.expectedFee?.isPositive() && !disabled) ||
            !!soulboundTokenHint
          }
          variant={ButtonVariant.contained}
          i18n={I18N.transactionConfirmationSend}
          onPress={onConfirmTransaction}
          style={styles.submit}
          loading={disabled}
        />
      </PopupContainer>
    );
  },
);

const styles = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  soulboundTokenHintLabel: {
    textAlign: 'center',
  },
  soulboundTokenHint: {
    justifyContent: 'center',
  },
  contact: {
    marginHorizontal: 27.5,
    fontWeight: '600',
    height: 30,
  },
  address: {
    marginBottom: 40,
    marginHorizontal: 27.5,
  },
  subtitle: {
    marginBottom: 4,
  },
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 160,
    height: 160,
  },
  info: {
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  submit: {
    marginVertical: 16,
  },
  feeContainer: {
    flexDirection: 'row',
  },
});
