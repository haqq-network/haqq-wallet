import React, {useCallback} from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {STRICT_URLS} from '@app/screens/browser-home-page-screen';
import {Link} from '@app/types';

import {LinkPreview, LinkPreviewVariant} from './link-preview';
import {CustomHeader, Icon, IconButton, IconsName, Spacer, Text} from './ui';

interface BrowserEditBookmarksProps {
  links: Link[];

  onDragEnd(links: Link[]): void;

  onPressRemove(link: Link): void;

  onPressBack(): void;

  onPressSubmit(): void;
}

export const BrowserEditBookmarks = ({
  links,
  onDragEnd,
  onPressRemove,
  onPressBack,
  onPressSubmit,
}: BrowserEditBookmarksProps) => {
  const renderItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<Link>) => {
      if (!item?.id) {
        return null;
      }

      const handlePressRemove = () => {
        onPressRemove?.(item);
      };

      const isStrictUrl = !!STRICT_URLS.find(link => item.url === link.url);

      return (
        <ScaleDecorator activeScale={1.05}>
          <Spacer height={16} />
          <View style={styles.item}>
            <IconButton disabled={isStrictUrl} onPress={handlePressRemove}>
              <Icon
                name={IconsName.circle_minus}
                color={isStrictUrl ? Color.transparent : Color.graphicRed1}
              />
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
              <Spacer width={25} />
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

  if (!links?.length) {
    return (
      <>
        <CustomHeader
          title={I18N.editBookmarksTitle}
          iconLeft="arrow_back"
          onPressLeft={onPressBack}
        />
        <View style={styles.emptyContainer}>
          <View style={styles.squareContainer}>
            <Icon name={IconsName.square} color={Color.graphicSecond3} />
            <Spacer width={6} />
            <Icon name={IconsName.square} color={Color.graphicSecond3} />
            <Spacer width={6} />
            <Icon name={IconsName.square} color={Color.graphicSecond3} />
          </View>
          <Spacer height={4} />
          <Text t14 i18n={I18N.thereNoBookmarks} color={Color.textBase2} />
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader
        title={I18N.editBookmarksTitle}
        iconLeft="arrow_back"
        onPressLeft={onPressBack}
        iconRight="check"
        colorRight={Color.graphicGreen1}
        onPressRight={onPressSubmit}
      />
      <View style={styles.container}>
        <DraggableFlatList<Link>
          data={links}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          containerStyle={styles.flatList}
          onDragEnd={handleDragEnd}
        />
      </View>
    </>
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
  squareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
