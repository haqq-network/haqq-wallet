import {useEffect, useState} from 'react';

import {ObjectChangeCallback} from 'realm';

import {VariablesString} from '@app/models/variables-string';

export function useVariablesString(key: string) {
  const [value, setValue] = useState(VariablesString.get(key));

  useEffect(() => {
    const item = VariablesString.getById(key);

    const onChange: ObjectChangeCallback<VariablesString> = it => {
      if (value !== it.value) {
        setValue(it.value);
      }
    };

    if (item) {
      item.addListener(onChange as ObjectChangeCallback<any>);

      return () => {
        item.removeListener(onChange as ObjectChangeCallback<any>);
      };
    }
  }, [key, value]);

  return value;
}
