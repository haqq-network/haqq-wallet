import React, {useMemo} from 'react';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import {Color} from '@app/colors';
import {useTheme} from '@app/hooks';
import {addOpacityToColor} from '@app/utils';

export type SkeletonPlaceholderProps = {
  /**
   * Determines component's children.
   */
  children: JSX.Element;
  /**
   * Determines the color of placeholder.
   */
  backgroundColor?: Color;
  /**
   * Determines the highlight color of placeholder.
   */
  highlightColor?: Color;
  /**
   * Determines the animation speed in milliseconds. Use 0 to disable animation
   */
  speed?: number;
  /**
   * Determines the animation direction, left or right
   */
  direction?: 'left' | 'right';
  /**
   * Determines if Skeleton should show placeholders or its children.
   */
  enabled?: boolean;
  /**
   * Determines default border radius for placeholders from both SkeletonPlaceholder.Item and generated from children.
   */
  borderRadius?: number;
  angle?: number;
  /**
   * Determines width of the highlighted area
   */
  shimmerWidth?: number;
  opacity?: number;
};

type PlaceholderType = React.FC<SkeletonPlaceholderProps> & {
  Item: typeof SkeletonPlaceholder.Item;
};

const Placeholder: PlaceholderType = function Placeholder({
  opacity = 1,
  backgroundColor,
  highlightColor,
  ...props
}) {
  const theme = useTheme();
  const _backgroundColor = useMemo(
    () => addOpacityToColor(backgroundColor || Color.graphicSecond1, opacity),
    [theme, opacity],
  );

  const _highlightColor = useMemo(
    () => addOpacityToColor(highlightColor || Color.graphicSecond4, 0.7),
    [theme],
  );

  return (
    <SkeletonPlaceholder
      enabled={true}
      backgroundColor={_backgroundColor}
      highlightColor={_highlightColor}
      borderRadius={12}
      speed={2000}
      shimmerWidth={100}
      {...props}
    />
  );
};

Placeholder.Item = SkeletonPlaceholder.Item;

export {Placeholder};
