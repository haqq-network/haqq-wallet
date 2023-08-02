import {differenceInDays} from 'date-fns';
import InAppReview from 'react-native-in-app-review';

import {VariablesDate} from '@app/models/variables-date';

const REQUEST_REVIEW_DAYS_INTERVAL = 7;

const logger = Logger.create('onAppReviewRequest');
export async function onAppReviewRequest() {
  try {
    if (!InAppReview.isAvailable()) {
      return logger.warn('in app review not supported');
    }

    const lastReviewDate = VariablesDate.get('lastInAppReviewDate');

    const notReadyForReview =
      lastReviewDate &&
      differenceInDays(Date.now(), lastReviewDate) <=
        REQUEST_REVIEW_DAYS_INTERVAL;

    if (notReadyForReview) {
      return logger.warn('not ready for review');
    }

    // `hasFlowFinishedSuccessfully` means:
    //  - for android:
    //      The flow has finished. The API does not indicate whether the user
    //      reviewed or not, or even whether the review dialog was shown. Thus, no
    //      matter the result, we continue our app flow.
    //
    //  - for ios:
    //      the flow lanuched successfully, The API does not indicate whether the user
    //      reviewed or not, or he/she closed flow yet as android, Thus, no
    //      matter the result, we continue our app flow.
    const hasFlowFinishedSuccessfully = await InAppReview.RequestInAppReview();

    if (hasFlowFinishedSuccessfully) {
      VariablesDate.set('lastInAppReviewDate', new Date());
    }
  } catch (err) {
    logger.captureException(err, 'onAppReviewRequest', {
      // @ts-ignore
      code: err.code,
    });
  }
}
