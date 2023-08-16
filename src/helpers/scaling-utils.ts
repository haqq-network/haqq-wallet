/**
 * SOURCE: https://github.com/nirsky/react-native-size-matters
 */

import {Dimensions} from 'react-native';

//Default guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const getWindowDimensions = () => Dimensions.get('window');

export const getDimension = () => {
  const {width, height} = getWindowDimensions();
  const [shortDimension, longDimension] =
    width < height ? [width, height] : [height, width];
  return {shortDimension, longDimension};
};

export const getWindowWidth = () => getWindowDimensions().width;
export const getWindowHeight = () => getWindowDimensions().height;

export const scale = (size: number) =>
  (getDimension().shortDimension / guidelineBaseWidth) * size;
export const verticalScale = (size: number) =>
  (getDimension().longDimension / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
export const moderateVerticalScale = (size: number, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;
