import PostHog from 'posthog-react-native';
import {Adjust, AdjustConfig, AdjustEvent} from 'react-native-adjust';
import {AdjustOaid} from 'react-native-adjust-oaid';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';

import {app} from '@app/contexts';
import {Initializable} from '@app/helpers/initializable';
import {MarketingEvents} from '@app/types';
import {getAppTrackingAuthorizationStatus} from '@app/utils';
import {IS_ANDROID} from '@app/variables/common';

const logger = Logger.create('EventTracker');

const DISABLED = __DEV__ || Config.FOR_DETOX;

export class EventTracker extends Initializable {
  public static instance = new EventTracker();

  private _posthog: PostHog | null = null;

  get posthog() {
    return this._posthog;
  }

  get adjust() {
    return Adjust;
  }

  initialize() {
    if (DISABLED) {
      return;
    }
    this.startInitialization();
    this._configureAdjust();
    this._configurePosthog();
    this.stopInitialization();
  }

  async trackEvent(
    event: MarketingEvents,
    params: Record<string, string> = {},
  ) {
    if (DISABLED) {
      return logger.warn(
        'EventTracker is disabled for development',
        event,
        params,
      );
    }
    await this.awaitForInitialization();
    this._trackAdjustEvent(event, params);
    this._trackPosthogEvent(event, params);
  }

  async getAdjustAdid() {
    if (DISABLED) {
      return '';
    }
    return new Promise<string>(resolve => {
      Adjust.getAdid(adid => {
        resolve(adid);
      });
    });
  }

  async getPosthogAdid() {
    if (DISABLED) {
      return '';
    }
    await this.awaitForInitialization();
    return this._posthog?.getDistinctId() || '';
  }

  // TODO: change default type to 'posthog' after removing adjust
  async getAdid(type: 'adjust' | 'posthog' = 'adjust'): Promise<string> {
    let adid = await EncryptedStorage.getItem('adid');

    if (!adid) {
      switch (type) {
        case 'posthog':
          adid = await this.getPosthogAdid();
          break;
        case 'adjust':
        default:
          adid = await this.getAdjustAdid();
      }

      if (adid) {
        await EncryptedStorage.setItem('adid', adid);
      }
    }

    return adid;
  }

  async setPushToken(token: string) {
    if (DISABLED) {
      return;
    }
    await this.awaitForInitialization();
    this.adjust.setPushToken(token);
    this.posthog?.identify(this.posthog.getDistinctId(), {
      push_token: token,
    });
  }

  dispose() {
    if (DISABLED) {
      return;
    }
    this.adjust.componentWillUnmount();
    this._posthog = null;
    this.rejectInitialization();
  }

  private _trackAdjustEvent(
    event: MarketingEvents,
    params: Record<string, string> = {},
  ) {
    const adjustEvent = new AdjustEvent(event);

    Object.entries(params).forEach(([key, value]) => {
      adjustEvent.addPartnerParameter(key, JSON.stringify(value));
    });

    Adjust.trackEvent(adjustEvent);
  }

  private _trackPosthogEvent(
    event: MarketingEvents,
    params: Record<string, string> = {},
  ) {
    this._posthog?.capture(event, {$set: params});
  }

  private _configureAdjust() {
    try {
      const adjustConfig = new AdjustConfig(
        Config.ADJUST_TOKEN,
        Config.ADJUST_ENVIRONMENT,
      );

      adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
      if (IS_ANDROID) {
        AdjustOaid.readOaid();
      }

      Adjust.create(adjustConfig);
      if (app.isDeveloper) {
        getAppTrackingAuthorizationStatus().then(status => {
          logger.log('Authorization status = ' + status);
        });
      }
    } catch (error) {
      logger.captureException(error, 'adjust initialization error');
    }
  }

  private _configurePosthog() {
    try {
      this._posthog = new PostHog(Config.POSTHOG_API_KEY, {
        host: Config.POSTHOG_HOST,
      });
    } catch (error) {
      logger.captureException(error, 'posthog initialization error');
    }
  }
}
