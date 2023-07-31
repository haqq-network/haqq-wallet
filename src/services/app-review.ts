import {differenceInDays} from 'date-fns';
import InAppReview from 'react-native-in-app-review';

import {captureException} from '@app/helpers';
import {VariablesDate} from '@app/models/variables-date';

export class AppReview {
  static requestReviewDaysInterval = 7;

  private static set lastReviewDate(date: Date) {
    VariablesDate.set('lastInAppReviewDate', date);
  }

  static get lastReviewDate(): Date | undefined {
    return VariablesDate.get('lastInAppReviewDate');
  }

  static get isAvailable() {
    return InAppReview.isAvailable();
  }

  static async requestReview() {
    try {
      if (!this.isAvailable) {
        return console.warn('[AppReview]: in app review not supported');
      }

      const notReadyForReview =
        this.lastReviewDate &&
        differenceInDays(Date.now(), this.lastReviewDate) <=
          AppReview.requestReviewDaysInterval;

      if (notReadyForReview) {
        return console.warn('[AppReview]: not ready for review');
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
      const hasFlowFinishedSuccessfully =
        await InAppReview.RequestInAppReview();

      if (hasFlowFinishedSuccessfully) {
        AppReview.lastReviewDate = new Date();
      }
    } catch (err) {
      captureException(err, 'AppReview.requestReview', {
        // @ts-ignore
        code: err.code,
        isAvailable: this.isAvailable,
        lastReviewDate: this.lastReviewDate,
        requestReviewDaysInterval: this.requestReviewDaysInterval,
      });
    }
  }
}
