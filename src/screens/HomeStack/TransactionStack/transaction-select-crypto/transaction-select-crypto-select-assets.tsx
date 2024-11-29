import {useCallback} from 'react';

import {View} from 'react-native';

import {
  ActionButton,
  ButtonVariant,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {
  TransactionSelectCryptoAssetType,
  TransactionSelectCryptoSelectAssetsProps,
} from './transaction-select-crypto.types';

export const TransactionSelectCryptoSelectAssets = ({
  assetType,
  onChange,
}: TransactionSelectCryptoSelectAssetsProps) => {
  const handlePress = useCallback(
    (type: TransactionSelectCryptoAssetType) => () => {
      onChange(type);
    },
    [],
  );

  return (
    <View style={styles.container}>
      <Text
        i18n={I18N.typeAssets}
        variant={TextVariant.t6}
        style={styles.header}
      />
      <View style={styles.buttonContainer}>
        <ActionButton
          isActive={assetType === TransactionSelectCryptoAssetType.Crypto}
          variant={ButtonVariant.contained}
          i18n={I18N.transactionCrypto}
          iconLeft={IconsName.islm}
          onPress={handlePress(TransactionSelectCryptoAssetType.Crypto)}
        />
        <Spacer width={8} />
        <ActionButton
          isActive={assetType === TransactionSelectCryptoAssetType.NFT}
          variant={ButtonVariant.contained}
          i18n={I18N.nftWidgetTitle}
          iconLeft={IconsName.image}
          onPress={handlePress(TransactionSelectCryptoAssetType.NFT)}
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});
