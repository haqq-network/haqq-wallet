import React, {useCallback} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  LottieWrap,
  NetworkFee,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {NftItem} from '@app/models/nft';
import {Provider} from '@app/models/provider';
import {sendNotification} from '@app/services';
import {TransactionResponse} from '@app/types';
import {STRINGS} from '@app/variables/common';

import {ImageWrapper} from './image-wrapper';

type TransactionFinishProps = {
  transaction: TransactionResponse | null;
  item: NftItem;
  onSubmit: () => void;
  onPressContact: () => void;
  contact: Contact | null;
  short: string;
  fee: Fee;
};

export const TransactionNftFinish = observer(
  ({
    transaction,
    item,
    onSubmit,
    onPressContact,
    contact,
    fee,
  }: TransactionFinishProps) => {
    const onPressHash = async () => {
      const url = Provider.selectedProvider.getTxExplorerUrl(
        transaction?.hash!,
      );
      await openURL(url);
    };

    const onPressToAddress = useCallback(() => {
      Clipboard.setString(transaction?.to ?? '');
      sendNotification(I18N.notificationCopied);
    }, [transaction]);

    const nftImageUri = useNftImage(
      typeof item.cached_url === 'string'
        ? item.cached_url
        : item.metadata?.image,
    );

    return (
      <PopupContainer style={styles.container}>
        <View style={styles.sub}>
          <LottieWrap
            source={require('@assets/animations/transaction-finish.json')}
            style={styles.image}
            autoPlay
            loop={false}
          />
        </View>
        <Text
          variant={TextVariant.t4}
          i18n={I18N.transactionNftFinishSendingComplete}
          style={styles.title}
          position={TextPosition.center}
          color={Color.textGreen1}
        />
        <ImageWrapper
          source={nftImageUri}
          style={styles.icon}
          borderRadius={12}
        />
        <Text variant={TextVariant.t5} position={TextPosition.center}>
          {item.name}
        </Text>
        <Spacer height={8} />
        <View style={styles.contactLine}>
          {contact?.name && (
            <Text
              variant={TextVariant.t13}
              position={TextPosition.center}
              style={styles.address}>
              {contact.name}
            </Text>
          )}
          <Text
            variant={TextVariant.t14}
            position={TextPosition.center}
            selectable
            onPress={onPressToAddress}
            style={styles.address}>
            {transaction?.to}
          </Text>
        </View>

        <NetworkFee fee={fee.expectedFee} />

        <View style={styles.providerContainer}>
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {Provider.selectedProvider.name}
          </Text>
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {`${STRINGS.NBSP}(${Provider.selectedProvider.denom})`}
          </Text>
        </View>

        <Spacer minHeight={20} />
        <View style={styles.buttons}>
          <IconButton onPress={onPressContact} style={styles.button}>
            {contact ? (
              <Icon
                name="pen"
                i24
                color={Color.graphicBase2}
                style={styles.buttonIcon}
              />
            ) : (
              <Icon
                name="user"
                i24
                color={Color.graphicBase2}
                style={styles.buttonIcon}
              />
            )}
            <Text
              i18n={
                contact
                  ? I18N.transactionFinishEditContact
                  : I18N.transactionFinishAddContact
              }
              variant={TextVariant.t15}
              position={TextPosition.center}
              color={Color.textBase2}
            />
          </IconButton>
          <IconButton onPress={onPressHash} style={styles.button}>
            <Icon
              name="block"
              color={Color.graphicBase2}
              style={styles.buttonIcon}
              i24
            />
            <Text
              variant={TextVariant.t15}
              position={TextPosition.center}
              i18n={I18N.transactionFinishHash}
              color={Color.textBase2}
            />
          </IconButton>
        </View>
        <Button
          style={styles.margin}
          variant={ButtonVariant.contained}
          i18n={I18N.transactionFinishDone}
          onPress={onSubmit}
        />
      </PopupContainer>
    );
  },
);

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
  },
  address: {
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 28,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  margin: {marginBottom: 16},
  contactLine: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  providerContainer: {
    backgroundColor: Color.bg8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
});
