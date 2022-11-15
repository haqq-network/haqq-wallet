import {ImageStyle, TextStyle, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {app} from '@app/contexts';

type NamedStyles<T> = {[P in keyof T]: ViewStyle | TextStyle | ImageStyle};

export function createTheme<T extends NamedStyles<T> | NamedStyles<any>>(
  styles: T | NamedStyles<T>,
): T {
  const style = {};
  const cache = new Map();
  const keys = Object.keys(styles);
  const styled = Object.keys(Color);

  keys.forEach(key => {
    Object.defineProperty(style, key, {
      get() {
        const k = `${key}_${app.getTheme()}`;
        if (!cache.has(k)) {
          const res =
            styles[key] instanceof Object
              ? Object.entries(styles[key]).reduce((memo, [prop, value]) => {
                  return {
                    ...memo,
                    [prop]: styled.includes(value as string)
                      ? getColor(value as Color)
                      : value,
                  };
                }, {})
              : styles[key];

          cache.set(k, res);
        }

        return cache.get(k) ?? {};
      },
    });
  });

  return style as U;
}
