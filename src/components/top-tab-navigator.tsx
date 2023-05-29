import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {I18N} from '@app/i18n';

import {TopTabNavigatorLarge} from './top-tab-navigator-large';
import {TopTabNavigatorSmall} from './top-tab-navigator-small';

export enum TopTabNavigatorVariant {
  small = 'small',
  large = 'large',
}

export interface TopTabNavigatorExtendedProps {
  tabList: TabType[];
  activeTab: TabType;
  activeTabIndex: number;
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
};

export type TopTabNavigatorComponent = {
  Tab: typeof Tab;
} & React.FC<TopTabNavigatorProps>;

export interface TabProps {
  name: string;
  title: string | I18N;
  component: React.ComponentType<{}> | JSX.Element;
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
  ...props
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

  const onTabPress = useCallback((tab: TabType, index: number) => {
    setActiveTabIndex(index);
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (filteredChildren[activeTabIndex]) {
      setActiveTab(filteredChildren[activeTabIndex]);
    }
  }, [activeTab, filteredChildren, activeTabIndex]);

  switch (variant) {
    case TopTabNavigatorVariant.small:
      return (
        <TopTabNavigatorSmall
          tabList={filteredChildren}
          activeTab={activeTab}
          activeTabIndex={activeTabIndex}
          onTabPress={onTabPress}
          {...props}
        />
      );
    case TopTabNavigatorVariant.large:
      return (
        <TopTabNavigatorLarge
          tabList={filteredChildren}
          activeTab={activeTab}
          activeTabIndex={activeTabIndex}
          onTabPress={onTabPress}
          {...props}
        />
      );
    default:
      return <></>;
  }
};

const Tab: React.FC<TabProps> = ({component}) => {
  const Component = component;
  //@ts-ignore
  return React.isValidElement(Component) ? Component : <Component />;
};

TopTabNavigator.Tab = Tab;

export {TopTabNavigator};
