import React, {memo, useCallback} from 'react';

import {View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useLayout} from '@app/hooks/use-layout';
import {getText} from '@app/i18n';
import {isI18N} from '@app/utils';
import {SHADOW_COLOR_1} from '@app/variables/common';

import {TopTabNavigatorExtendedProps} from './top-tab-navigator';
import {Text} from './ui';

export type TopTabNavigatorLargeProps = TopTabNavigatorExtendedProps & {
  showSeparators?: boolean;
};

const TAB_PADDING = 3;

export const TopTabNavigatorLarge = memo(
  ({
    tabList,
    activeTab,
    containerStyle,
    contentContainerStyle,
    showSeparators,
    activeTabIndex,
    tabHeaderStyle,
    onTabPress,
  }: TopTabNavigatorLargeProps) => {
    const [tabLayout, onTabLayout] = useLayout(
      layout => (offset.value = calcOffset(activeTabIndex, layout.width)),
    );
    const offset = useSharedValue(activeTabIndex * tabLayout.width);

    const calcOffset = useCallback(
      (index: number, width: number) =>
        index * width + TAB_PADDING * 2 * (index + 1) - TAB_PADDING,
      [],
    );

    const animate = useCallback(
      (index: number, cb: () => void) => {
        offset.value = withTiming(
          calcOffset(index, tabLayout.width),
          {
            duration: 190,
            easing: Easing.inOut(Easing.quad),
            reduceMotion: ReduceMotion.System,
          },
          () => runOnJS(cb)(),
        );
      },
      [tabLayout],
    );

    const activeTabIndicatorStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: offset.value,
          },
        ],
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
            const showSeparator =
              showSeparators &&
              index !== tabList.length - 1 &&
              activeTabIndex !== index &&
              activeTabIndex - 1 !== index;

            return (
              <React.Fragment key={`${tab.props.title}_${index}`}>
                <TouchableOpacity
                  onLayout={onTabLayout}
                  containerStyle={styles.tab}
                  style={styles.tabTouchable}
                  testID={tab.props.testID}
                  onPress={() => {
                    const onPress = () => onTabPress(tab, index);
                    // Animation:
                    animate(index, onPress);
                  }}>
                  <Text t14={!isActive} t13={isActive}>
                    {title}
                  </Text>
                </TouchableOpacity>
                {showSeparator && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.tabSeparator}
                  />
                )}
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
  },
);

const styles = createTheme({
  tabSeparator: {
    width: 1,
    height: 16,
    alignSelf: 'center',
    backgroundColor: Color.graphicSecond2,
    transform: [{translateX: -0.5}],
    zIndex: 1,
  },
  activeTabIndicator: {
    zIndex: 2,
    backgroundColor: Color.bg1,
    position: 'absolute',
    borderRadius: 12,
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
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
    zIndex: 2,
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
