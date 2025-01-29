declare module 'json-stable-stringify';

declare module 'react-native-markdown-package';

declare const Logger: import('@app/services/logger').LoggerService;
declare const IS_DETOX: boolean;

declare module 'react-timer-mixin';

declare module 'react-native-blasted-image' {
  import {ComponentType} from 'react';

  import {ImageProps, ImageStyle, ImageURISource} from 'react-native';
  export interface BlastedImageProps extends ImageProps {
    onLoad?: () => void;
    onError?: (error: Error) => void;
    style: ImageStyle;
  }

  export interface Static {
    preload: (params: (ImageURISource & {skipMemoryCache?: boolean})[]) => void;
    clearAllCaches: () => void;
  }

  const BlastedImage: ComponentType<BlastedImageProps> & Static;

  // eslint-disable-next-line import/no-default-export
  export default BlastedImage;
}
