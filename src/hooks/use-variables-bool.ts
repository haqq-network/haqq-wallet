import {useEffect, useState} from 'react';

import {ObjectChangeCallback} from 'realm';

import {VariablesBool} from '@app/models/variables-bool';

export function useVariablesBool(key: string) {
  const [value, setValue] = useState(VariablesBool.get(key));

  useEffect(() => {
    const item = VariablesBool.getById(key);

    const onChange: ObjectChangeCallback<VariablesBool> = it => {
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
