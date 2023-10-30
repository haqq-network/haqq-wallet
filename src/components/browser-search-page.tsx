import React, {useCallback, useMemo, useRef, useState} from 'react';

import {PhishingController} from '@metamask/phishing-controller';
import {FlatList, ListRenderItem, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useTesterModeEnabled} from '@app/hooks/use-tester-mode-enabled';
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

import {onUrlSubmit, showPhishingAlert} from '../helpers/web3-browser-utils';

export interface BrowserSearchPageProps {
  searchHistory: Realm.Results<Web3BrowserSearchHistory>;
  initialSearchText?: string;

  onPressCancel(): void;

  onPressClearHistory(): void;

  onLinkPress?(link: Link): void;

  onSubmitSearch(text: string): void;
}

export const BrowserSearchPage = ({
  searchHistory,
  initialSearchText,
  onLinkPress,
  onPressCancel,
  onSubmitSearch,
  onPressClearHistory,
}: BrowserSearchPageProps) => {
  const isTesterMode = useTesterModeEnabled();

  const [text, setText] = useState(initialSearchText || '');
  const phishingController = useRef(new PhishingController()).current;
  const recentLinks = useMemo(
    () =>
      text
        ? searchHistory.filtered(
            'url CONTAINS[c] $0 or title CONTAINS[c] $0',
            text,
          )
        : searchHistory,
    [searchHistory, text],
  );

  const onChangeText = useCallback((str: string) => {
    setText(str);
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
                <Icon
                  name={IconsName.search}
                  color={Color.graphicSecond2}
                  i24
                />
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
              i18n={I18N.clear}
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
          editable={isTesterMode}
          leftAction={
            <Icon i16 color={Color.graphicBase2} name={IconsName.search} />
          }
          value={text}
          onChangeText={onChangeText}
          placeholder={getText(I18N.browserSearch)}
          keyboardType="web-search"
          autoFocus
          onSubmitEditing={handleSubmitSearch}
          style={styles.inputContainer}
          inputStyle={styles.input}
        />
        <Button
          onPress={onPressCancel}
          textColor={Color.textGreen1}
          i18n={I18N.cancel}
        />
      </View>

      <FlatList<Link>
        data={recentLinks}
        ListHeaderComponent={renderListHeaderComponent}
        renderItem={renderHistoryItem}
        keyExtractor={historyKeyExtractor}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
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
    height: '100%',
    width: '100%',
    alignSelf: 'center',
  },
  inputContainer: {
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
