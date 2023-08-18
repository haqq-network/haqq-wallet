import React, {ReactNode, memo} from 'react';

import {ScrollView, Text, View} from 'react-native';

import {createTheme} from '@app/helpers';
import {IWidget, IWidgetBase} from '@app/types';
import {generateUUID} from '@app/utils';

type IWidgetMap = {
  [key in IWidget['component']]: (
    params: IWidget & {children?: ReactNode},
  ) => ReactNode;
};

const Element = (params: IWidget) => (
  <View
    key={generateUUID()}
    style={{
      flex: 1,
      backgroundColor: params?.component === 'Layout' ? 'green' : 'red',
      margin: 10,
      flexDirection: params?.direction === 'horizontal' ? 'row' : 'column',
    }}>
    <Text>{params.component}</Text>
    {params?.children}
  </View>
);

const WidgetMap: IWidgetMap = {
  Transactions: params => <Element {...params} />,
  TransactionsShort: params => <Element {...params} />,
  Raffles: params => <Element {...params} />,
  Staking: params => <Element {...params} />,
  Governance: params => <Element {...params} />,
  Layout: params => <Element {...params} />,
  Ad: params => <Element {...params} />,
  Banner: params => <Element {...params} />,
};

const EmptyComponent = () => <Element {{component: 'Unknown'}} />;

export const WidgetRoot = memo(() => {
  const data = MOCK_DATA;
  if (!data) {
    return null;
  }

  const renderWidgetsList = (widgets: IWidget[]): ReactNode[] => {
    return widgets.map(widget => {
      const component = WidgetMap[widget.component] || EmptyComponent;

      if (widget.component === 'Layout') {
        return component({
          ...widget,
          children: renderWidgetsList(widget.child),
        });
      }

      return component(widget);
    });
  };

  return <View style={styles.wrapper}>{renderWidgetsList(data)}</View>;
});

const styles = createTheme({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

const MOCK_DATA = [
  {
    component: 'Transactions',
  },
  {
    component: 'TransactionsShort',
  },
  {
    component: 'Raffles',
  },
  {
    component: 'Staking',
  },
  {
    component: 'Governance',
  },
  {
    component: 'Layout',
    direction: 'horizontal',
    child: [
      {
        component: 'Ad',
        title: 'string',
        description: 'string',
        background_from: 'string',
        background_to: 'string',
        background_image: 'optional string',
        title_color: 'optional string',
        description_color: 'optional string',
      },
      {
        component: 'Governance',
      },
    ],
  },
  {
    component: 'Ad',
    title: 'string',
    description: 'string',
    background_from: 'string',
    background_to: 'string',
    background_image: 'optional string',
    title_color: 'optional string',
    description_color: 'optional string',
    target: 'string',
  },
  {
    component: 'Banner',
    title: 'string',
    description: 'string',
    button_title: 'string',
    button_color: 'string',
    button_background_color: 'string',
    background_color_from: 'string',
    background_color_to: 'string',
    background_image_url: 'string',
    title_color: 'optional string',
    description_color: 'optional string',
    target: 'string',
  },
  {
    test: 123,
  },
];
