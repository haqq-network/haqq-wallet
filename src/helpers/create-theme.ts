import {app} from '../contexts/app';
import {Color, getColor} from '../colors';

export function createTheme<
  T extends Record<string, any>,
  U extends {
    [key in keyof T]: any;
  },
>(styles: T): U {
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
