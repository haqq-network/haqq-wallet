import React from 'react';

import {View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useTiming} from 'react-native-redash';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useLayout} from '@app/hooks/use-layout';
import {getText} from '@app/i18n';
import {isI18N} from '@app/utils';

import {TopTabNavigatorExtendedProps} from './top-tab-navigator';
import {Text} from './ui';

export type TopTabNavigatorLargeProps = TopTabNavigatorExtendedProps & {
  showSeparators?: boolean;
};

const TAB_PADDING = 3;

export const TopTabNavigatorLarge = ({
  tabList,
  activeTab,
  containerStyle,
  contentContainerStyle,
  showSeparators,
  activeTabIndex,
  tabHeaderStyle,
  onTabPress,
}: TopTabNavigatorLargeProps) => {
  const [tabLayout, onTabLayout] = useLayout();
  const animatedIndex = useTiming(activeTabIndex);

  const activeTabIndicatorStyle = useAnimatedStyle(() => {
    const translateX =
      animatedIndex.value * tabLayout.width +
      TAB_PADDING * 2 * (activeTabIndex + 1) -
      TAB_PADDING;
    return {
      transform: [{translateX}],
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.tabsHeader, tabHeaderStyle]}>
        <Animated.View
          style={[
            styles.activeTabIndicator,
            activeTabIndicatorStyle,
            {width: tabLayout.width, height: tabLayout.height},
          ]}
        />
        {tabList.map((tab, index) => {
          const isActive = tab?.props?.name === activeTab?.props?.name;
          const title = isI18N(tab.props.title)
            ? getText(tab.props.title)
            : tab.props.title;
          const showSeparator = showSeparators && index !== tabList.length - 1;

          return (
            <React.Fragment key={`${tab.props.title}_${index}`}>
              <TouchableOpacity
                onLayout={onTabLayout}
                containerStyle={styles.tab}
                style={styles.tabTouchable}
                onPress={() => {
                  onTabPress(tab, index);
                }}>
                <Text t14={!isActive} t13={isActive}>
                  {title}
                </Text>
              </TouchableOpacity>
              {showSeparator && <View style={styles.tabSeparator} />}
            </React.Fragment>
          );
        })}
      </View>
      {!!activeTab && (
        <View style={[styles.tabContent, contentContainerStyle]}>
          {activeTab}
        </View>
      )}
    </View>
  );
};

const styles = createTheme({
  tabSeparator: {
    width: 1,
    height: 16,
    alignSelf: 'center',
    backgroundColor: Color.graphicSecond2,
    transform: [{translateX: -0.5}],
  },
  activeTabIndicator: {
    backgroundColor: Color.bg1,
    position: 'absolute',
    borderRadius: 14,
  },
  container: {
    flex: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    maxHeight: 40,
    borderRadius: 14,
    paddingVertical: TAB_PADDING,
    backgroundColor: Color.bg3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginHorizontal: TAB_PADDING,
  },
  tabTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {},
});
