import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {StyleSheet, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {I18N, getText} from '@app/i18n';
import {isI18N} from '@app/utils';

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
  name: string;
  title: string | I18N;
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

  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  const [activeTab, setActiveTab] = useState(
    filteredChildren?.[activeTabIndex],
  );
  const RigntActon = activeTab?.props?.rigntActon;

  const onTabPress = useCallback((tab: TabType, index: number) => {
    setActiveTabIndex(index);
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (filteredChildren[activeTabIndex]) {
      setActiveTab(filteredChildren[activeTabIndex]);
    }
  }, [activeTab, filteredChildren, activeTabIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        scrollEnabled={scrollHeaderEnabled}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.tabsHeader}>
          {filteredChildren.map((tab, index) => {
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
      <View style={styles.tabContent}>{activeTab}</View>
    </View>
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
