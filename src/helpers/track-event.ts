import analytics from '@react-native-firebase/analytics';

import {captureException} from '@app/helpers/capture-exception';
import {VariablesBool} from '@app/models/variables-bool';

export async function trackEvent(
  event: string,
  params: Record<string, any> = {},
) {
  if (VariablesBool.get('analytics')) {
    try {
      await analytics().logEvent(event, params);
    } catch (e) {
      captureException(e, 'trackEvent', {event, params});
    }
  }
}
