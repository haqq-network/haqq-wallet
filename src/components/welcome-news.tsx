import React from 'react';

import {FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Results} from 'realm';

import {Color} from '@app/colors';
import {NewsRow} from '@app/components/news/news-row';
import {Button, ButtonSize, ButtonVariant, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {News as NewsModel} from '@app/models/news';

type WelcomeProps = {
  news: Results<NewsModel>;
  onPress: (id: string) => void;
  onPressSignup: () => void;
  onPressLedger: () => void;
  onPressSignIn: () => void;
};

export const WelcomeNews = ({
  onPressSignup,
  onPressLedger,
  onPressSignIn,
  news,
  onPress,
}: WelcomeProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <FlatList
        data={news}
        renderItem={({item}) => <NewsRow item={item} onPress={onPress} />}
      />
      <View style={styles.buttons}>
        <Button
          i18n={I18N.welcomeCreateWallet}
          testID="welcome_signup"
          variant={ButtonVariant.contained}
          onPress={onPressSignup}
          size={ButtonSize.large}
        />
        <Spacer height={16} />
        <Button
          testID="welcome_ledger"
          i18n={I18N.welcomeLedgerWallet}
          iconRight="ledger"
          iconRightColor={Color.graphicGreen1}
          variant={ButtonVariant.second}
          onPress={onPressLedger}
          size={ButtonSize.large}
        />
        <Spacer height={16} />
        <Button
          testID="welcome_signin"
          i18n={I18N.welcomeRestoreWallet}
          onPress={onPressSignIn}
          size={ButtonSize.large}
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
  },
  buttons: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});
