import React, {useCallback, useEffect, useRef} from 'react';

import {format} from 'date-fns';
import {some} from 'lodash';
import {Image, Linking} from 'react-native';
import {NativeScrollEvent} from 'react-native/Libraries/Components/ScrollView/ScrollView';
import {NativeSyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import Markdown from 'react-native-markdown-package';

import {Color} from '@app/colors';
import {PopupContainer, Spacer, Text} from '@app/components/ui';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {createTheme} from '@app/helpers';
import {News} from '@app/models/news';
import {AdjustEvents} from '@app/types';

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

type NodeText = {
  type: 'text';
  content: string;
};

type Node = NodeImage | NodeHeading | NodeParagraph | NodeText;

export type NewsDetailProps = {
  item: News;
};

type Output = (
  content: Node | Node[],
  state: Record<string, any>,
) => React.ReactNode;

const rules = {
  heading: {
    react: (node: NodeHeading, output: Output, {...state}) => {
      return (
        <Text t7 style={styles.heading} color={Color.textBase1} key={state.key}>
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
        <Text
          t11
          style={styles.paragraph}
          color={Color.textBase1}
          key={state.key}>
          {output(node.content, {
            ...state,
            withinParagraphWithImage: false,
          })}
        </Text>
      );
    },
  },
  text: {
    react: (node: NodeText, output: Output, {...state}) => {
      let textStyle = {
        ...(state.style || {}),
      };

      return (
        <Text clean key={state.key} style={textStyle}>
          {node.content}
        </Text>
      );
    },
  },
};

export const NewsDetail = ({item}: NewsDetailProps) => {
  const scrolled = useRef(false);

  useEffect(() => {
    onTrackEvent(AdjustEvents.newsOpenItem, {
      id: item.id,
    });
  }, [item.id]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrolled.current && e.nativeEvent.contentOffset.y > 50) {
        onTrackEvent(AdjustEvents.newsScrolledItem, {
          id: item.id,
        });
        scrolled.current = true;
      }
    },
    [item.id],
  );

  return (
    <PopupContainer style={styles.container} onScroll={onScroll}>
      <Text t3>{item.title}</Text>
      <Spacer height={12} />
      <Text t17 color={Color.textBase2}>
        {format(item.publishedAt, 'MMM dd, yyyy')}
      </Text>
      <Spacer height={20} />
      <Markdown
        rules={rules}
        styles={markdownStyle}
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
  paragraph: {marginVertical: 8},
});

const markdownStyle = createTheme({
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
});
