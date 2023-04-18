import React, {useCallback, useMemo} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {createTheme} from '@app/helpers';

import {LinkPreviewProps} from './link-preview';
import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';
import {Text} from './ui';

export const LinkPreviewSquare = ({
  link,
  disabled,
  onPress,
}: LinkPreviewProps) => {
  const handleLinkPress = useCallback(() => {
    onPress?.(link);
  }, [link, onPress]);

  const WrapperComponent = useMemo(
    () => (disabled ? View : TouchableOpacity),
    [disabled],
  );

  return (
    // @ts-ignore
    <WrapperComponent style={styles.container} onPress={handleLinkPress}>
      <SiteIconPreview
        size={SiteIconPreviewSize.s60}
        url={link.url}
        directIconUrl={link.icon}
        title={link.title}
      />
      <Text t15 numberOfLines={1} style={styles.title}>
        {link.title}
      </Text>
    </WrapperComponent>
  );
};

const styles = createTheme({
  container: {
    width: 60,
  },
  title: {
    width: 60,
    maxWidth: 60,
  },
});
