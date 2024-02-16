import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {FlatList, ListRenderItem, View} from 'react-native';

import {Color} from '@app/colors';
import {ImageWrapper} from '@app/components/image-wrapper';
import {
  CustomHeader,
  Icon,
  IconButton,
  IconsName,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme, scale} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Currencies} from '@app/models/currencies';
import {Currency} from '@app/models/types';

export type SettingsThemeProps = {
  goBack: () => void;
};

export const SettingsCurrency = observer(({goBack}: SettingsThemeProps) => {
  const availableCurrencies = Currencies.currencies;
  const selectedCurrency = Currencies.selectedCurrency;

  const getCurrencyDescription = useCallback((item: Currency) => {
    const usableParts = [item.id];
    item.prefix && usableParts.unshift(item.prefix);
    item.postfix && usableParts.push(item.postfix);

    return usableParts.join(' \u00B7 ');
  }, []);

  const setSelectedCurrency = useCallback(
    (selectedCurrencyId: string) => () => {
      Currencies.selectedCurrency = selectedCurrencyId;
    },
    [],
  );

  const renderItem: ListRenderItem<Currency> = useCallback(
    ({item}) => {
      return (
        <IconButton
          onPress={setSelectedCurrency(item.id)}
          style={styles.listItemContainer}>
          <View style={styles.currencyInfoContainer}>
            <ImageWrapper source={{uri: item.icon}} style={styles.icon} />
            <View>
              <View>
                <Text variant={TextVariant.t11} style={styles.currencyTitle}>
                  {item.title}
                </Text>
              </View>
              <View>
                <Text color={Color.textBase2}>
                  {getCurrencyDescription(item)}
                </Text>
              </View>
            </View>
          </View>
          {selectedCurrency === item.id && (
            <Icon name={IconsName.check} color={Color.textGreen1} i24 />
          )}
        </IconButton>
      );
    },
    [getCurrencyDescription, selectedCurrency, setSelectedCurrency],
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        onPressLeft={goBack}
        iconLeft="arrow_back"
        title={I18N.settingsCurrencyScreen}
      />
      <FlatList
        data={availableCurrencies}
        renderItem={renderItem}
        bounces={false}
      />
    </View>
  );
});

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
  listItemContainer: {
    height: scale(74),
    width: '100%',
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    height: scale(42),
    width: scale(42),
    borderRadius: scale(8),
    marginRight: scale(10),
  },
  currencyInfoContainer: {
    flexDirection: 'row',
  },
  currencyTitle: {fontSize: 18},
});
