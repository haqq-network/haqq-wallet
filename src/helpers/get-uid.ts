import {VariablesString} from '@app/models/variables-string';
import {makeID} from '@app/utils';

export function getUid() {
  if (!VariablesString.exists('uid')) {
    VariablesString.set('uid', makeID(10));
  }

  return VariablesString.get('uid') ?? '';
}
