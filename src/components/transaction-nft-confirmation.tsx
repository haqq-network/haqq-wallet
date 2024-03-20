import React, {useMemo} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/use-nft-image';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {NftItem} from '@app/models/nft';
import {Balance} from '@app/services/balance';
import {splitAddress} from '@app/utils';
import {CURRENCY_NAME, WEI} from '@app/variables/common';

interface TransactionConfirmationProps {
  to: string;
  item: NftItem;
  fee: Balance;
  contact: Contact | null;
  disabled?: boolean;
  onConfirmTransaction: () => void;
}

export const TransactionNftConfirmation = ({
  disabled,
  contact,
  to,
  item,
  fee,
  onConfirmTransaction,
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
      <View style={styles.info}>
        <DataView label="Network Fee">
          <Text variant={TextVariant.t11} color={Color.textBase1}>
            {/* TODO: Migrate to fee.toWeiString() */}
            {`${+fee * WEI} a${CURRENCY_NAME}`}
          </Text>
        </DataView>
      </View>
      <Spacer />
      <Button
        disabled={!fee.isPositive() && !disabled}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionConfirmationSend}
        onPress={onConfirmTransaction}
        style={styles.submit}
        loading={disabled}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
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
});
