import React, {useCallback, useMemo, useRef, useState} from 'react';

import {PhishingController} from '@metamask/phishing-controller';
import {FlatList, ListRenderItem, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Link} from '@app/types';

import {LinkPreview, LinkPreviewVariant} from './link-preview';
import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconsName,
  Input,
  MenuNavigationButton,
  Spacer,
  Text,
} from './ui';
import {
  onUrlSubmit,
  showPhishingAlert,
} from './web3-browser/web3-browser-utils';

export interface BrowserSearchPageProps {
  searchHistory: Realm.Results<Web3BrowserSearchHistory>;

  onPressCancel(): void;

  onPressClearHistory(): void;

  onLinkPress?(link: Link): void;

  onSubmitSearch(text: string): void;
}

// const TEST_URLS: Link[] = [
//   {id: 'app.haqq', title: 'app ap papapap pa', url: 'https://app.haqq.network'},
//   {id: 'vesting', title: 'vesting', url: 'https://vesting.haqq.network'},
//   {id: 'app.uniswap', title: 'app', url: 'https://app.uniswap.org'},
//   {id: 'testedge2', title: 'testedge2', url: 'https://testedge2.haqq.network'},
//   {id: 'safe', title: 'safe', url: 'https://safe.testedge2.haqq.network'},
//   {
//     id: 'metamask',
//     title: 'metamask',
//     url: 'https://metamask.github.io/test-dapp/',
//   },
// ];

export const BrowserSearchPage = ({
  searchHistory,
  onLinkPress,
  onPressCancel,
  onSubmitSearch,
  onPressClearHistory,
}: BrowserSearchPageProps) => {
  const [text, setText] = useState('');
  const phishingController = useRef(new PhishingController()).current;
  const recentLinks = useMemo(
    () =>
      text
        ? searchHistory.filtered(
            `url CONTAINS[c] '${text}' or title CONTAINS[c] '${text}'`,
          )
        : searchHistory,
    [searchHistory, text],
  );

  const onChangeText = useCallback((str: string) => {
    setText(str?.trim?.());
  }, []);

  const handleSubmitSearch = useCallback(async () => {
    const url = onUrlSubmit(text);
    await phishingController.maybeUpdateState();
    const {result} = phishingController.test(url);

    if (result) {
      const allowNavigateToPhishing = await showPhishingAlert();
      if (!allowNavigateToPhishing) {
        return;
      }
    }
    onSubmitSearch(url);
    setText('');
  }, [onSubmitSearch, phishingController, text]);

  const historyKeyExtractor = useCallback((link: Link) => link.id, []);

  const renderHistoryItem: ListRenderItem<Link> = useCallback(
    ({index, item}) => {
      if (!item) {
        return null;
      }
      return (
        <>
          {(index > 0 || !!text) && <Spacer height={16} />}
          <LinkPreview
            link={item}
            onPress={onLinkPress}
            variant={LinkPreviewVariant.line}
          />
        </>
      );
    },
    [onLinkPress, text],
  );

  const renderListHeaderComponent = useCallback(
    () => (
      <First>
        {!!text && (
          <>
            <Spacer height={16} />
            <MenuNavigationButton onPress={handleSubmitSearch}>
              <View style={styles.searchIconContainer}>
                <Icon name={'search'} color={Color.graphicSecond2} i24 />
              </View>
              <Spacer width={12} />
              <Text t11 numberOfLines={1} style={styles.searchText}>
                {text}
              </Text>
            </MenuNavigationButton>
          </>
        )}
        {!!recentLinks?.length && (
          <View style={styles.historyContainer}>
            <Text t10 i18n={I18N.browserSearchHistory} />
            <Spacer flex={1} />
            <Button
              i18n={I18N.Clear}
              onPress={onPressClearHistory}
              textColor={Color.textGreen1}
              variant={ButtonVariant.text}
            />
          </View>
        )}
        <></>
      </First>
    ),
    [handleSubmitSearch, onPressClearHistory, recentLinks?.length, text],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Input
          leftAction={
            <Icon i16 color={Color.graphicBase2} name={IconsName.search} />
          }
          value={text}
          onChangeText={onChangeText}
          placeholder={getText(I18N.browserSearch)}
          keyboardType={'web-search'}
          autoFocus
          onSubmitEditing={handleSubmitSearch}
          style={styles.input}
        />
        <Button
          onPress={onPressCancel}
          textColor={Color.textGreen1}
          title="Cancel"
        />
      </View>

      <FlatList<Link>
        data={recentLinks}
        ListHeaderComponent={renderListHeaderComponent}
        renderItem={renderHistoryItem}
        keyExtractor={historyKeyExtractor}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'always'}
        keyboardDismissMode={'none'}
      />
    </SafeAreaView>
  );
};

const styles = createTheme({
  searchIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchText: {
    width: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: getColor(Color.bg1),
  },
  input: {
    minHeight: 36,
    height: 36,
    maxHeight: 36,
    flex: 1,
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});
