import React, {useCallback} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {LinkPreviewProps} from './link-preview';
import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';
import {MenuNavigationButton, Spacer, Text} from './ui';

export const LinkPreviewLine = ({
  link,
  onPress,
  hideArrow,
  disabled,
}: LinkPreviewProps) => {
  const handleLinkPress = useCallback(() => {
    onPress?.(link);
  }, [link, onPress]);

  return (
    <MenuNavigationButton
      disabled={disabled}
      hideArrow={hideArrow}
      style={styles.container}
      onPress={handleLinkPress}>
      <View style={styles.content}>
        <View>
          <SiteIconPreview
            size={SiteIconPreviewSize.s42}
            url={link.url}
            directIconUrl={link.icon}
            title={link.title}
          />
        </View>
        <Spacer width={12} />
        <View style={styles.textContainer}>
          <Text t11 numberOfLines={1} style={styles.text}>
            {link.title}
          </Text>
          <Text
            t14
            numberOfLines={1}
            style={styles.text}
            color={Color.textBase2}>
            {link.url}
          </Text>
        </View>
      </View>
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  textContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    transform: [{translateY: -3}],
  },
  content: {
    flexDirection: 'row',
    width: '100%',
    height: 42,
  },
  text: {
    width: '85%',
  },
  container: {
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
});
