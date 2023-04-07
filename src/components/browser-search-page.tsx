import React from 'react';

import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {I18N, getText} from '@app/i18n';

import {Button, Icon, IconsName, Input} from './ui';

export interface BrowserSearchPageProps {
  onPressCancel(): void;
}

export const BrowserSearchPage = ({onPressCancel}: BrowserSearchPageProps) => {
  return (
    <SafeAreaView style={styles.constainer}>
      <View style={styles.header}>
        <Input
          leftAction={
            <Icon color={Color.graphicBase2} name={IconsName.search} />
          }
          placeholder={getText(I18N.browserSearch)}
          keyboardType={'web-search'}
          autoFocus
          style={styles.input}
        />
        <Button
          onPress={onPressCancel}
          textColor={Color.textGreen1}
          title="Cancel"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  constainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  input: {
    minHeight: 36,
    height: 36,
    maxHeight: 36,
    flex: 1,
  },
});
