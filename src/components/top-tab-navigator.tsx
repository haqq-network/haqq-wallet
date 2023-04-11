import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {SafeAreaView, StyleSheet, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

import {Color} from '@app/colors';

import {Spacer, Text} from './ui';

export interface TopTabNavigatorProps {
  children: Element | Element[];
  /** @default false */
  scrollHeaderEnabled?: boolean;
  /** @default 0 */
  initialTabIndex?: number;
}

type TopTabNavigatorComponent = {
  Tab: typeof Tab;
} & React.FC<TopTabNavigatorProps>;

interface TabProps {
  title: string;
  component: React.ComponentType<{}> | JSX.Element;
  rigntActon?: React.ComponentType<{}> | JSX.Element;
}

type TabType = Omit<JSX.Element, 'props'> & {
  type: object;
  props: TabProps;
};
/**
 * @example
 *   <TopTabNavigator scrollHeaderEnabled initialTabIndex={1}>
 *     <TopTabNavigator.Tab
 *       component={Component}
 *       title={'Test component 1'}
 *       rigntActon={RigntActonComponent}
 *     />
 *     <TopTabNavigator.Tab
 *       component={Component2}
 *       title={'Test component 2'}
 *       rigntActon={<Button title={'Edit'}/>}
 *     />
 *  </TopTabNavigator>
 */
const TopTabNavigator: TopTabNavigatorComponent = ({
  children,
  scrollHeaderEnabled = false,
  initialTabIndex = 0,
}) => {
  const filteredChildren: TabType[] = useMemo(() => {
    if (Array.isArray(children)) {
      return children?.filter((child: TabType) => {
        return child.type === Tab;
      });
    } else {
      return [children];
    }
  }, [children]);

  const [activeTab, setActiveTab] = useState(
    filteredChildren?.[initialTabIndex],
  );
  const RigntActon = activeTab?.props?.rigntActon;

  const onTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!activeTab && filteredChildren[initialTabIndex]) {
      setActiveTab(filteredChildren[initialTabIndex]);
    }
  }, [activeTab, filteredChildren, initialTabIndex]);

  return (
    <SafeAreaView style={styles.tabsContainer}>
      <ScrollView
        horizontal
        scrollEnabled={scrollHeaderEnabled}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.tabsHeader}>
          {filteredChildren.map((tab, index) => {
            const isActive = tab === activeTab;
            const textColor = isActive ? Color.textBase1 : Color.textBase2;
            const notFirstTab = index > 0;
            return (
              <TouchableOpacity
                key={`${tab.props.title}_${index}`}
                onPress={() => onTabPress(tab)}>
                <Text
                  color={textColor}
                  style={notFirstTab && styles.tabTitleInsents}
                  t10>
                  {tab.props.title}
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
      <View>{activeTab}</View>
    </SafeAreaView>
  );
};

const Tab: React.FC<TabProps> = ({component}) => {
  const Component = component;
  //@ts-ignore
  return React.isValidElement(Component) ? <>{Component}</> : <Component />;
};

TopTabNavigator.Tab = Tab;

export {TopTabNavigator};

const styles = StyleSheet.create({
  scrollViewContent: {
    minWidth: '100%',
  },
  tabsContainer: {
    width: '100%',
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  tabTitleInsents: {
    marginLeft: 12,
  },
});
