import {Dimensions, ImageStyle, TextStyle, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {app} from '@app/contexts';

type StyleValue<T> = T | (() => T);
type StyleValueToCommon<T> = T extends () => infer U ? U : T;
type ResolveStyleValue<T> = {
  [StyleName in keyof T]: {
    [Property in keyof T[StyleName]]: StyleValueToCommon<
      T[StyleName][Property]
    >;
  };
};

type CustomStyleValues = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
};

type Style =
  | {[K in keyof ViewStyle]: StyleValue<ViewStyle[K]>}
  | {[K in keyof TextStyle]: StyleValue<TextStyle[K]>}
  | {[K in keyof ImageStyle]: StyleValue<ImageStyle[K]>}
  | {[K in keyof CustomStyleValues]: StyleValue<CustomStyleValues[K]>};

type NamedStyles<T> = {
  [P in keyof T]: Style;
};

export function createTheme<T extends NamedStyles<T> | NamedStyles<any>>(
  styles: T | NamedStyles<T>,
): ResolveStyleValue<T> {
  const style = {};
  const cache: Map<string, Style> = new Map();
  const keys = Object.keys(styles);
  const styled = Object.keys(Color);

  keys.forEach(key => {
    Object.defineProperty(style, key, {
      get() {
        const dimensions = Dimensions.get('window');
        const k = `${key}_${app.currentTheme}_${dimensions.width}_${dimensions.height}`;
        if (!cache.has(k)) {
          // @ts-ignore
          const res = Object.entries(styles[key]).reduce(
            (memo, [prop, value]) => {
              if (typeof value === 'function') {
                value = value();
              }
              return {
                ...memo,
                [prop]: styled.includes(value as string)
                  ? getColor(value as Color)
                  : value,
              };
            },
            {},
          );

          cache.set(k, res);
        }

        return cache.get(k) ?? {};
      },
    });
  });

  return style as ResolveStyleValue<T>;
}
