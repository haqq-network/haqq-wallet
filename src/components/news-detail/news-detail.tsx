import React, {useCallback, useEffect, useRef} from 'react';

import {format} from 'date-fns';
import {head, includes} from 'lodash';
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
    react: (node: NodeImage) => {
      return (
        <View key={makeID(10)} style={styles.imageWrapper}>
          <Image
            source={{uri: node.target}}
            style={styles.image}
            resizeMode="center"
          />
        </View>
      );
    },
  },
  paragraph: {
    react: (node: NodeParagraph, output: Output, {...state}) => {
      return (
        <Text
          t11
          style={styles.paragraph}
          color={Color.textBase1}
          key={makeID(10)}>
          {output(node.content, {
            ...state,
          })}
        </Text>
      );
    },
  },
  text: {
    react: (node: NodeText, output: Output, {...state}) => {
      let textStyle: TextStyle = {
        ...(state.style || {}),
      };

      return (
        <Text clean key={makeID(10)} style={textStyle} color={Color.textBase1}>
          {node.content}
        </Text>
      );
    },
  },
  list: {
    react: function (node: NodeList, output: Output, {...state}) {
      let numberIndex = 1;
      const items = node.items.map(item => {
        state.withinList = false;

        if (item.length > 1) {
          if (item[1].type === 'list') {
            state.withinList = true;
          }
        }

        const content = output(item, state);
        let listItem;
        if (
          includes(['text', 'paragraph', 'strong'], (head(item) || {}).type) &&
          !state.withinList
        ) {
          state.withinList = true;

          listItem = (
            <Text t11 key={makeID(10)}>
              {content}
            </Text>
          );
        } else {
          listItem = <View key={makeID(10)}>{content}</View>;
        }
        state.withinList = false;

        return (
          <View key={makeID(10)} style={styles.listRow}>
            <Text key={makeID(10)} t11>
              {node.ordered ? numberIndex++ + '. ' : '\u2022 '}
            </Text>
            {listItem}
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

  const onClickLink = useCallback(async (url: string) => {
    onTrackEvent(AdjustEvents.newsOpenLink, {
      url,
    });

    await openURL(url);
  }, []);

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
  heading: {marginBottom: 8, marginTop: 28},
  paragraph: {marginVertical: 8},
  listRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  imageWrapper: {paddingTop: 28},
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
