import {ImageStyle, TextStyle, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {app} from '@app/contexts';

type Style =
  | ViewStyle
  | TextStyle
  | ImageStyle
  | {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };

type NamedStyles<T> = {
  [P in keyof T]: Style;
};

export function createTheme<T extends NamedStyles<T> | NamedStyles<any>>(
  styles: T | NamedStyles<T>,
): T {
  const style = {};
  const cache: Map<string, Style> = new Map();
  const keys = Object.keys(styles);
  const styled = Object.keys(Color);

  keys.forEach(key => {
    Object.defineProperty(style, key, {
      get() {
        const k = `${key}_${app.getTheme()}`;
        if (!cache.has(k)) {
          // @ts-ignore
          const res = Object.entries(styles[key]).reduce(
            (memo, [prop, value]) => {
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

  return style as T;
}
