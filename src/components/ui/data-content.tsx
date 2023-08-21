import React from 'react';

import {View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Card} from '@app/components/ui/card';
import {Spacer} from '@app/components/ui/spacer';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';

export type DataContentProps = {
  title?: React.ReactNode;
  subtitle?: string | React.ReactNode;
  style?: ViewStyle;
  reversed?: boolean;
  short?: boolean;
  numberOfLines?: number;
  titleI18n?: I18N;
  subtitleI18n?: I18N;
  subtitleI18nParams?: Record<string, string>;
  titleI18nParams?: Record<string, string>;
  onPress?: () => void;
  wallet?: Wallet;
};
export const DataContent = ({
  title,
  short,
  subtitle,
  style,
  reversed,
  onPress,
  titleI18n,
  subtitleI18n,
  subtitleI18nParams,
  titleI18nParams,
  numberOfLines = 1,
  wallet,
}: DataContentProps) => {
  return (
    <View
      style={[
        styles.container,
        reversed && styles.reverse,
        short && styles.short,
        style,
      ]}>
      {/* @ts-expect-error */}
      <Text
        t11
        style={styles.title}
        color={Color.textBase1}
        ellipsizeMode="tail"
        i18n={titleI18n}
        i18params={titleI18nParams}
        numberOfLines={numberOfLines}
        onPress={onPress}>
        {title}
      </Text>
      {(subtitleI18n || subtitle) && (
        <View style={styles.walletWrapper}>
          {!!wallet && (
            <>
              <Card
                width={20}
                height={14}
                pattern={wallet?.pattern}
                colorFrom={wallet?.colorFrom}
                colorTo={wallet?.colorTo}
                colorPattern={wallet?.colorPattern}
                borderRadius={3}
                style={styles.removePadding}
              />
              <Spacer width={6} />
            </>
          )}
          {/* @ts-expect-error */}
          <Text
            t14
            i18n={subtitleI18n}
            i18params={subtitleI18nParams}
            color={Color.textBase2}>
            {subtitle}
          </Text>
        </View>
      )}
    </View>
  );
};
const styles = createTheme({
  walletWrapper: {flexDirection: 'row', alignItems: 'center'},
  removePadding: {padding: 0},
  container: {
    paddingVertical: 16,
  },
  short: {
    paddingVertical: 8,
  },
  title: {
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  reverse: {flexDirection: 'column-reverse'},
});
