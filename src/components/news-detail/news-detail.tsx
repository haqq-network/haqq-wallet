import React from 'react';

import {some} from 'lodash';
import {Image, Linking, Platform} from 'react-native';
import Markdown from 'react-native-markdown-package';

import {Color} from '@app/colors';
import {PopupContainer, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {News} from '@app/models/news';
import {FontT} from '@app/types';

type NodeImage = {
  alt: string;
  target: string;
  title: undefined | string;
  type: 'image';
};
type NodeHeading = {
  type: 'heading';
  level: number;
  content: Node[];
};

type NodeParagraph = {
  type: 'paragraph';
  content: Node[];
};

type Node = NodeImage | NodeHeading | NodeParagraph;

export type NewsDetailProps = {
  item: News;
};

const sfProTextBold700: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
  },
  android: {
    fontFamily: 'SF-ProText-Bold',
  },
});

const sfProTextRegular400: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
  },
  android: {
    fontFamily: 'SF-Pro-Display-Regular',
  },
});

type Output = (
  content: Node | Node[],
  state: Record<string, any>,
) => React.ReactNode;

const rules = {
  heading: {
    react: (node: NodeHeading, output: Output, {...state}) => {
      return (
        <Text t7 style={styles.heading}>
          {output(node.content, {
            ...state,
            withinText: true,
            withinHeading: true,
          })}
        </Text>
      );
    },
  },
  image: {
    react: (node: NodeImage, output: Output, {...state}) => {
      return (
        <Image
          key={state.key}
          source={{uri: node.target}}
          style={styles.image}
          resizeMode="contain"
        />
      );
    },
  },
  paragraph: {
    react: (node: NodeParagraph, output: Output, {...state}) => {
      console.log('node', JSON.stringify(node, null, 2));

      if (some(node.content, {type: 'image'})) {
        return (
          <>
            {output(node.content, {
              ...state,
            })}
          </>
        );
      }

      return (
        <Text t11 style={styles.text}>
          {output(node.content, {
            ...state,
            withinParagraphWithImage: false,
          })}
        </Text>
      );
    },
  },
};

export const NewsDetail = ({item}: NewsDetailProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Text t3>{item.title}</Text>
      <Spacer height={12} />
      <Markdown
        rules={rules}
        styles={markdownStyle.collectiveMd}
        onLink={(url: string) => Linking.openURL(url)}>
        {item.content}
      </Markdown>
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  image: {
    height: 200,
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
  },
  heading: {marginBottom: 8, marginTop: 28},
  text: {marginVertical: 8},
});

const markdownStyle = {
  singleLineMd: {
    view: {
      alignSelf: 'stretch',
    },

    heading2: {
      ...sfProTextBold700,
      fontSize: 18,
      lineHeight: 24,
      color: Color.textBase1,
    },
  },
  collectiveMd: createTheme({
    // eslint-disable-next-line react-native/no-unused-styles
    strong: {
      textAlign: 'left',
    },
    // eslint-disable-next-line react-native/no-unused-styles
    blockQuoteSection: {
      flexDirection: 'row',
    },
    // eslint-disable-next-line react-native/no-unused-styles
    blockQuoteSectionBar: {
      width: 3,
      marginRight: 15,
    },
    // eslint-disable-next-line react-native/no-unused-styles
    heading2: {
      ...sfProTextBold700,
      fontSize: 18,
      lineHeight: 24,
      color: Color.textBase1,
    },
    // eslint-disable-next-line react-native/no-unused-styles
    text: {
      ...sfProTextRegular400,
      fontSize: 16,
      lineHeight: 22,
      color: Color.textBase1,
    },
  }),
};
