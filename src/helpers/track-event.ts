import analytics from '@react-native-firebase/analytics';

import {VariablesBool} from '@app/models/variables-bool';

export async function trackEvent(
  event: string,
  params: Record<string, any> = {},
) {
  if (VariablesBool.get('analytics')) {
    try {
      await analytics().logEvent(event, params);
    } catch (e) {
      Logger.captureException(e, 'trackEvent', {event, params});
    }
  }
}
