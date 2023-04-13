import React, {useCallback} from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Link} from '@app/types';

import {LinkPreview, LinkPreviewVariant} from './link-preview';
import {Icon, IconButton, IconsName, Spacer} from './ui';

interface BrowserEditBookmarksProps {
  links: Link[];
  onDragEnd(links: Link[]): void;
  onPressRemove(link: Link): void;
}

export const BrowserEditBookmarks = ({
  links,
  onDragEnd,
  onPressRemove,
}: BrowserEditBookmarksProps) => {
  const insets = useSafeAreaInsets();
  const renderItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<Link>) => {
      if (!item) {
        return null;
      }

      const handlePressremove = () => {
        onPressRemove?.(item);
      };

      return (
        <ScaleDecorator activeScale={1.05}>
          <Spacer height={16} />
          <View style={styles.item}>
            <IconButton onPress={handlePressremove}>
              <Icon name={IconsName.circle_minus} color={Color.graphicRed1} />
            </IconButton>
            <Spacer width={18} />
            <TouchableOpacity
              onLongPress={drag}
              disabled={isActive}
              style={styles.tochableOpacity}>
              <View style={styles.linkContainer}>
                <LinkPreview
                  hideArrow
                  disabled
                  link={item}
                  variant={LinkPreviewVariant.line}
                />
              </View>
              <Icon name={IconsName.list} color={Color.graphicSecond3} />
            </TouchableOpacity>
          </View>
        </ScaleDecorator>
      );
    },
    [onPressRemove],
  );

  const keyExtractor = useCallback((item: Link) => item.id, []);

  const handleDragEnd = useCallback(
    ({data}: DragEndParams<Link>) => {
      onDragEnd?.(data);
    },
    [onDragEnd],
  );

  return (
    <View style={[styles.container, {marginTop: insets.top}]}>
      <DraggableFlatList<Link>
        data={links}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        containerStyle={styles.flatList}
        onDragEnd={handleDragEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22.5,
  },
  linkContainer: {flex: 1},
  tochableOpacity: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
});
