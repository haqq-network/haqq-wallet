import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {StyleProp, ViewStyle} from 'react-native';

import {I18N} from '@app/i18n';

import {TopTabNavigatorLarge} from './top-tab-navigator-large';
import {TopTabNavigatorSmall} from './top-tab-navigator-small';

export enum TopTabNavigatorVariant {
  small = 'small',
  large = 'large',
}

export interface TopTabNavigatorExtendedProps {
  tabList: TabType[];
  activeTab: TabType | null;
  activeTabIndex: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  tabHeaderStyle?: StyleProp<ViewStyle>;

  onTabPress(tab: TabType, index: number): void;
}

export type TopTabNavigatorProps = {
  children: Element | Element[];
  /**
   * @description only for `TopTabNavigatorVariant.small`
   * @default false
   * */
  scrollHeaderEnabled?: boolean;
  /** @default 0 */
  initialTabIndex?: number;
  variant: TopTabNavigatorVariant;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  tabHeaderStyle?: StyleProp<ViewStyle>;
  showSeparators?: boolean;
  onTabChange?(tabName: TabType['props']['name']): void;
};

export type TopTabNavigatorComponent = {
  Tab: typeof Tab;
} & React.FC<TopTabNavigatorProps>;

export interface TabProps {
  name: string;
  title: string | I18N;
  component: React.ComponentType<{}> | JSX.Element | null;
  /**
   * @description only for `TopTabNavigatorVariant.small`
   */
  rigntActon?: React.ComponentType<{}> | JSX.Element;
}

export type TabType = Omit<JSX.Element, 'props'> & {
  type: object;
  props: TabProps;
};
/**
 * @example
 *   <TopTabNavigator scrollHeaderEnabled initialTabIndex={1} >
 *     <TopTabNavigator.Tab
 *       component={Component}
 *       name={'tab_1'}
 *       title={'Test component 1'}
 *       rigntActon={RigntActonComponent}
 *     />
 *     <TopTabNavigator.Tab
 *       component={Component2}
 *       name={'tab_2'}
 *       title={'Test component 2'}
 *       rigntActon={<Button title={'Edit'}/>}
 *     />
 *  </TopTabNavigator>
 */
const TopTabNavigator: TopTabNavigatorComponent = ({
  children,
  initialTabIndex = 0,
  variant,
  containerStyle,
  contentContainerStyle,
  showSeparators,
  tabHeaderStyle,
  onTabChange,
  ...props
}) => {
  const filteredChildren: TabType[] = useMemo(() => {
    if (Array.isArray(children)) {
      return children?.filter((child: TabType) => {
        return child?.type === Tab;
      });
    } else {
      return [children];
    }
  }, [children]);

  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  const [activeTab, setActiveTab] = useState(
    filteredChildren?.[activeTabIndex],
  );

  const onTabPress = useCallback(
    (tab: TabType, index: number) => {
      setActiveTabIndex(index);
      setActiveTab(tab);
      onTabChange?.(tab?.props?.name);
    },
    [onTabChange],
  );

  useEffect(() => {
    const tab = filteredChildren[activeTabIndex];
    if (tab) {
      setActiveTab(filteredChildren[activeTabIndex]);
      onTabChange?.(tab?.props?.name);
    }
  }, [activeTab, filteredChildren, activeTabIndex, onTabChange]);

  switch (variant) {
    case TopTabNavigatorVariant.small:
      return (
        <TopTabNavigatorSmall
          tabList={filteredChildren}
          activeTab={activeTab}
          activeTabIndex={activeTabIndex}
          containerStyle={containerStyle}
          tabHeaderStyle={tabHeaderStyle}
          contentContainerStyle={contentContainerStyle}
          onTabPress={onTabPress}
          {...props}
        />
      );
    case TopTabNavigatorVariant.large:
      return (
        <TopTabNavigatorLarge
          showSeparators={showSeparators}
          tabList={filteredChildren}
          activeTab={activeTab}
          activeTabIndex={activeTabIndex}
          containerStyle={containerStyle}
          tabHeaderStyle={tabHeaderStyle}
          contentContainerStyle={contentContainerStyle}
          onTabPress={onTabPress}
          {...props}
        />
      );
    default:
      return null;
  }
};

const Tab: React.FC<TabProps> = ({component}) => {
  const Component = component;
  if (!Component) {
    return null;
  }
  //@ts-ignore
  return React.isValidElement(Component) ? Component : <Component />;
};

TopTabNavigator.Tab = Tab;

export {TopTabNavigator};
