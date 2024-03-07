import React, {memo, useMemo} from 'react';

import {
  Image,
  ImageProps,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Color} from '@app/theme';

import {Spacer, Text, TextProps} from './ui';

export interface ImageDescriptionBlockProps {
  source: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
  title: I18N;
  titleParams?: TextProps['i18params'];
  description: I18N;
  descriptionParams?: TextProps['i18params'];
  onPress?(): void;
}

export const ImageDescriptionBlock = memo(
  ({
    source,
    style,
    title,
    description,
    titleParams,
    descriptionParams,
    onPress,
  }: ImageDescriptionBlockProps) => {
    const flattenStyle = useMemo(
      () => StyleSheet.flatten([styles.container, style]),
      [style],
    );

    return (
      <View style={flattenStyle}>
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
          <View style={styles.imageContainer}>
            <Image source={source} />
          </View>
          <View style={styles.textContainer}>
            <Text t7 i18n={title} i18params={titleParams} />
            <Spacer height={8} />
            <Text
              t14
              color={Color.textBase2}
              i18n={description}
              i18params={descriptionParams}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Color.graphicSecond3,
  },
  touchable: {
    flexDirection: 'row',
    padding: 20,
  },
  imageContainer: {
    flex: 1,
  },
  textContainer: {
    flex: 2,
    justifyContent: 'center',
    marginLeft: 12,
  },
});
