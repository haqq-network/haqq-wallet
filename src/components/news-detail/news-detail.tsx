import React, {useCallback, useEffect, useRef} from 'react';

import {format} from 'date-fns';
import {Dimensions, Image, TextStyle, View} from 'react-native';
import {NativeScrollEvent} from 'react-native/Libraries/Components/ScrollView/ScrollView';
import {NativeSyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import Markdown from 'react-native-markdown-package';
import SimpleMarkdown from 'simple-markdown';

import {Color} from '@app/colors';
import {PopupContainer, Spacer, Text} from '@app/components/ui';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {createTheme, openURL} from '@app/helpers';
import {News} from '@app/models/news';
import {AdjustEvents} from '@app/types';
import {makeID} from '@app/utils';

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

type NodeLink = {
  type: 'text';
  content: Node | Node[];
  target: string;
};

type NodeList = {
  items: Node[][];
  ordered: boolean;
  start: undefined;
  type: 'list';
};

type Node = NodeImage | NodeHeading | NodeParagraph | NodeText | NodeList;

export type NewsDetailProps = {
  item: News;
  openEvent: AdjustEvents;
  scrollEvent: AdjustEvents;
  linkEvent: AdjustEvents;
};

type Output = (
  content: Node | Node[],
  state: Record<string, any>,
) => React.ReactNode;

const LINK_INSIDE = '(?:\\[[^\\]]*\\]|[^\\]]|\\](?=[^\\[]*\\]))*';
const LINK_HREF_AND_TITLE =
  '\\s*<?([^\\s]*?)>?(?:\\s+[\'"]([\\s\\S]*?)[\'"])?\\s*';

const rules = {
  heading: {
    react: (node: NodeHeading, output: Output, {...state}) => {
      return (
        <Text
          t7
          style={styles.heading}
          color={Color.textBase1}
          key={makeID(10)}>
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
        <View
          key={makeID(10)}
          style={
            !state.withinList ? styles.imageWrapper : styles.inListImageWrapper
          }>
          <Image
            source={{uri: node.target}}
            style={[styles.image, state.withinList && styles.inListImage]}
            resizeMode="center"
          />
        </View>
      );
    },
  },
  paragraph: {
    react: (node: NodeParagraph, output: Output, {...state}) => {
      // If paragraph DOESN'T CONTAIN images than show it as plain text paragraph
      if (!node.content.find(c => c.type === 'image')) {
        const content = output(node.content, {
          ...state,
        });

        return (
          <Text
            t11
            style={!state.withinList && styles.paragraph}
            color={Color.textBase1}
            key={makeID(10)}>
            {content}
          </Text>
        );
      }

      // if paragraph CONTAIN images than split it to array of plain text and images
      let startSearchIndex = 0;
      const content = [];
      while (
        !(startSearchIndex === -1 || startSearchIndex === node.content.length)
      ) {
        const nodeImageIndex = node.content
          .slice(startSearchIndex)
          .findIndex(c => c.type === 'image');

        if (nodeImageIndex !== -1) {
          // Don't push text if previous node were image
          if (startSearchIndex !== nodeImageIndex) {
            content.push(
              <Text t11 color={Color.textBase1} key={makeID(10)}>
                {output(node.content.slice(startSearchIndex, nodeImageIndex), {
                  ...state,
                })}
              </Text>,
            );
          }
          content.push(
            output(node.content[nodeImageIndex], {
              ...state,
            }),
          );
          startSearchIndex = nodeImageIndex + 1;
        } else {
          content.push(
            <Text t11 color={Color.textBase1} key={makeID(10)}>
              {output(node.content.slice(startSearchIndex), {
                ...state,
              })}
            </Text>,
          );
          startSearchIndex = nodeImageIndex;
        }
      }

      return content;
    },
  },
  text: {
    react: (node: NodeText, output: Output, {...state}) => {
      let textStyle: TextStyle = {
        ...(state.style || {}),
      };

      return (
        <Text
          t11
          clean
          key={makeID(10)}
          style={textStyle}
          color={Color.textBase1}>
          {node.content}
        </Text>
      );
    },
  },
  list: {
    react: function (node: NodeList, output: Output, {...state}) {
      let numberIndex = 1;
      const items = node.items.map(item => {
        state.withinList = true;

        return (
          <View key={makeID(10)} style={styles.listRow}>
            <Text key={makeID(10)} t11>
              {node.ordered ? numberIndex++ + '. ' : '\u2022 '}
            </Text>
            <View key={makeID(10)}>{output(item, state)}</View>
          </View>
        );
      });
      return <View key={makeID(10)}>{items}</View>;
    },
  },
  link: {
    match: SimpleMarkdown.inlineRegex(
      new RegExp(
        '^\\[(' + LINK_INSIDE + ')\\]\\(' + LINK_HREF_AND_TITLE + '\\)',
      ),
    ),
    react: function (node: NodeLink, output: Output, {...state}) {
      state.withinLink = true;
      const _pressHandler = async () => {
        onTrackEvent(AdjustEvents.newsOpenLink, {
          url: node.target,
        });

        await openURL(node.target);
      };
      return (
        <Text
          t11
          onPress={_pressHandler}
          key={makeID(10)}
          color={Color.textGreen1}>
          {output(node.content, {...state, withinLink: true})}
        </Text>
      );
    },
  },
};

export const NewsDetail = ({
  item,
  openEvent,
  scrollEvent,
  linkEvent,
}: NewsDetailProps) => {
  const scrolled = useRef(false);

  useEffect(() => {
    onTrackEvent(openEvent, {
      id: item.id,
    });
  }, [item.id, openEvent]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrolled.current && e.nativeEvent.contentOffset.y > 50) {
        onTrackEvent(scrollEvent, {
          id: item.id,
        });
        scrolled.current = true;
      }
    },
    [item.id, scrollEvent],
  );

  const onClickLink = useCallback(
    async (url: string) => {
      onTrackEvent(linkEvent, {
        url,
      });

      await openURL(url);
    },
    [linkEvent],
  );

  return (
    <PopupContainer style={styles.container} onScroll={onScroll}>
      {item.preview && (
        <>
          <Image
            resizeMode={'cover'}
            source={{uri: item.preview}}
            style={styles.preview}
            borderRadius={12}
          />
          <Spacer height={24} />
        </>
      )}
      <Text t3>{item.title}</Text>
      <Spacer height={12} />
      <Text t17 color={Color.textBase2}>
        {format(item.publishedAt, 'MMM dd, yyyy')}
      </Text>
      <Spacer height={20} />
      <Markdown rules={rules} styles={markdownStyle} onLink={onClickLink}>
        {item.content}
      </Markdown>
    </PopupContainer>
  );
};

const HORIZONTAL_PADDING = 20;

const styles = createTheme({
  container: {paddingHorizontal: HORIZONTAL_PADDING},
  preview: {
    aspectRatio: 16 / 9,
    width: '100%',
    borderRadius: 12,
  },
  image: {
    height: 200,
    width: Dimensions.get('window').width - HORIZONTAL_PADDING * 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    justifyContent: 'center',
  },
  inListImage: {
    width: Dimensions.get('window').width - HORIZONTAL_PADDING * 3,
    paddingBottom: 40,
  },
  heading: {marginBottom: 8, marginTop: 28},
  paragraph: {marginVertical: 8},
  listRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  imageWrapper: {paddingTop: 16, paddingBottom: 8},
  inListImageWrapper: {paddingBottom: 8},
});

const markdownStyle = createTheme({
  // eslint-disable-next-line react-native/no-unused-styles
  strong: {textAlign: 'left'},
  // eslint-disable-next-line react-native/no-unused-styles
  blockQuoteSection: {flexDirection: 'row'},
  // eslint-disable-next-line react-native/no-unused-styles
  blockQuoteSectionBar: {
    width: 3,
    marginRight: 15,
  },
});
