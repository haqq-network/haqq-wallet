import {useEffect, useState} from 'react';

import {ObjectChangeCallback} from 'realm';

import {VariablesDate} from '@app/models/variables-date';

export function useVariablesDate(key: string) {
  const [value, setValue] = useState(VariablesDate.get(key));

  useEffect(() => {
    const item = VariablesDate.getById(key);

    const onChange: ObjectChangeCallback<VariablesDate> = it => {
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
