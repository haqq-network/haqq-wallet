import React, {useCallback} from 'react';

import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {Link} from '@app/types';

import {LinkPreview} from './link-preview';
import {Icon, IconsName, Spacer, Text} from './ui';

interface BrowserHomePageLinkListProps {
  links: Link[];
  emptyText: I18N;

  onLinkPress?(link: Link): void;
}

export const BrowserHomePageLinkList = ({
  links,
  emptyText,
  onLinkPress,
}: BrowserHomePageLinkListProps) => {
  const renderItem: ListRenderItem<Link> = useCallback(
    ({index, item}) => {
      if (!item?.id) {
        return null;
      }
      return (
        <>
          {index > 0 && <Spacer width={16} />}
          <LinkPreview onPress={onLinkPress} link={item} />
        </>
      );
    },
    [onLinkPress],
  );

  const keyExtractor = useCallback((item: Link) => item?.id, []);

  if (!links?.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.squareContainer}>
          <Icon name={IconsName.square} color={Color.graphicSecond3} />
          <Spacer width={6} />
          <Icon name={IconsName.square} color={Color.graphicSecond3} />
          <Spacer width={6} />
          <Icon name={IconsName.square} color={Color.graphicSecond3} />
        </View>
        <Spacer height={4} />
        <Text t14 i18n={emptyText} color={Color.textBase2} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList<Link>
        horizontal
        data={links}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 108,
    marginTop: 15,
    flexDirection: 'row',
  },
  contentContainerStyle: {
    justifyContent: 'center',
  },
  squareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 123,
  },
});
