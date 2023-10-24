import {makeID} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {navigator} from '@app/navigator';
import {isError} from '@app/utils';

export type AwaitValue<ExtendsType = {}> = {
  id: string;
  title: string;
  subtitle?: string;
} & ExtendsType;

export interface AwaitForValueParams<Value extends AwaitValue> {
  title: I18N | string;
  values: Value[];
  initialIndex?: number;
}

export class AwaitForValueError {
  name = 'AwaitForValueError';
  message?: string;

  constructor(err?: string | Error) {
    if (typeof err === 'string') {
      this.message = err;
    }

    if (isError(err)) {
      Object.assign(this, err);
    }
  }
}

type Title = string;
type Subtitle = string;

/**
 * @param values array of strings or array of [title, subtitle]
 */
export const stringsToValues = (
  values: (string | [Title, Subtitle])[],
): AwaitValue<{}>[] => {
  return values.map(value => {
    const id = makeID(5);
    if (typeof value === 'string') {
      return {
        id,
        title: value,
      };
    }

    const [title, subtitle] = value;
    return {
      id,
      title,
      subtitle,
    };
  });
};

type ObjectsToValuesParams<Value> = {
  titleKey?: keyof Value;
  subtitleKey?: keyof Value;
};

export const objectsToValues = <Value extends Object | Omit<AwaitValue, 'id'>>(
  values: Value[],
  params?: ObjectsToValuesParams<Value>,
): AwaitValue<Value>[] => {
  return values.map(value => {
    const id = makeID(5);
    const {titleKey, subtitleKey} = params || {};

    const title = titleKey
      ? (value[titleKey] as string)
      : 'title' in value && typeof value.title === 'string'
      ? value.title
      : '';

    const subtitle = subtitleKey
      ? (value[subtitleKey] as string)
      : 'subtitle' in value && typeof value.subtitle === 'string'
      ? value.subtitle
      : '';

    return {
      ...value,
      id,
      title,
      subtitle,
    };
  });
};

export async function awaitForValue<Value extends AwaitValue>({
  title,
  values,
  initialIndex,
}: AwaitForValueParams<Value>): Promise<Value> {
  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener('value-selected', onAction);
      app.removeListener('value-selected-reject', onReject);
    };

    const onAction = (index: number) => {
      removeAllListeners();
      resolve(values[index]);
    };

    const onReject = (err: Error | string) => {
      removeAllListeners();
      reject(new AwaitForValueError(err || 'rejected by user'));
    };

    app.addListener('value-selected', onAction);
    app.addListener('value-selected-reject', onReject);

    return navigator.navigate('valueSelector', {
      values: JSON.parse(JSON.stringify(values)),
      title: typeof title === 'string' ? title : getText(title),
      initialIndex,
    });
  });
}
