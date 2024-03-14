import React, {useCallback, useState} from 'react';

import {observer} from 'mobx-react';
import {FlatList, ListRenderItem, View} from 'react-native';

import {ImageWrapper} from '@app/components/image-wrapper';
import {
  Icon,
  IconButton,
  IconsName,
  Text,
  TextVariant,
} from '@app/components/ui';
import {SearchLine} from '@app/components/ui/custom-header/search-line';
import {Currencies} from '@app/models/currencies';
import {Currency} from '@app/models/types';
import {Color, createTheme} from '@app/theme';

export const SettingsCurrency = observer(() => {
  const [search, setSearch] = useState('');

  const filter = useCallback(
    (item: Currency) => {
      if (item.id.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }
      if (item.title.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }
      return false;
    },
    [search],
  );

  const availableCurrencies = Currencies.currencies.filter(filter);
  const selectedCurrency = Currencies.selectedCurrency;

  const getCurrencyDescription = useCallback((item: Currency) => {
    const usableParts = [item.id];
    item.prefix && usableParts.unshift(item.prefix);
    item.postfix && usableParts.push(item.postfix);

    return usableParts.join(' \u00B7 ');
  }, []);

  const setSelectedCurrency = useCallback(
    (selectedCurrencyId: string) => async () => {
      await Currencies.setSelectedCurrency(selectedCurrencyId);
    },
    [],
  );

  const renderItem: ListRenderItem<Currency> = useCallback(
    ({item}) => {
      return (
        <IconButton
          testID={item.id}
          onPress={setSelectedCurrency(item.id)}
          style={styles.listItemContainer}>
          <View style={styles.currencyInfoContainer}>
            <ImageWrapper source={{uri: item.icon}} style={styles.icon} />
            <View style={styles.descriptionContainer}>
              <Text variant={TextVariant.t11} style={styles.currencyTitle}>
                {item.title}
              </Text>
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

  const onSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <View style={styles.container}>
      <SearchLine
        onChange={onSearch}
        testId={'currency-search'}
        cancelEnabled={false}
        autoFocus={false}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={availableCurrencies}
        renderItem={renderItem}
        bounces={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
});

const styles = createTheme({
  container: {
    marginHorizontal: 20,
    flex: 1,
  },
  listItemContainer: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    height: 42,
    width: 42,
    borderRadius: 8,
    marginRight: 12,
  },
  currencyInfoContainer: {
    flexDirection: 'row',
  },
  descriptionContainer: {
    justifyContent: 'space-evenly',
  },
  currencyTitle: {fontSize: 18, marginBottom: 2},
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 50,
  },
});
