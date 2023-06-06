import React from 'react';

import {StyleSheet, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {getText} from '@app/i18n';
import {isI18N} from '@app/utils';

import {TopTabNavigatorExtendedProps} from './top-tab-navigator';
import {Spacer, Text} from './ui';

export type TopTabNavigatorSmallProps = TopTabNavigatorExtendedProps & {
  scrollHeaderEnabled?: boolean;
};

export const TopTabNavigatorSmall = ({
  scrollHeaderEnabled = false,
  tabList,
  activeTab,
  containerStyle,
  contentContainerStyle,
  tabHeaderStyle,
  onTabPress,
}: TopTabNavigatorSmallProps) => {
  const RigntActon = activeTab?.props?.rigntActon;

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        scrollEnabled={scrollHeaderEnabled}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.tabsHeader, tabHeaderStyle]}>
          {tabList.map((tab, index) => {
            const isActive = tab?.props?.name === activeTab?.props?.name;
            const textColor = isActive ? Color.textBase1 : Color.textBase2;
            const notFirstTab = index > 0;
            const title = isI18N(tab.props.title)
              ? getText(tab.props.title)
              : tab.props.title;
            return (
              <TouchableOpacity
                key={`${tab.props.title}_${index}`}
                onPress={() => onTabPress(tab, index)}>
                <Text
                  color={textColor}
                  style={notFirstTab && styles.tabTitleInsents}
                  t10>
                  {title}
                </Text>
              </TouchableOpacity>
            );
          })}
          {!!RigntActon && (
            <>
              <Spacer flex={1} width={12} />
              {/* @ts-ignore */}
              {React.isValidElement(RigntActon) ? RigntActon : <RigntActon />}
            </>
          )}
        </View>
      </ScrollView>
      {!!activeTab && (
        <View style={[styles.tabContent, contentContainerStyle]}>
          {activeTab}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
    minHeight: 22,
  },
  scrollViewContent: {
    minWidth: '100%',
    minHeight: 22,
  },
  container: {
    width: '100%',
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 22,
  },
  tabTitleInsents: {
    marginLeft: 12,
  },
  tabContent: {},
});
