import PostHog from 'posthog-react-native';
import {Adjust, AdjustConfig, AdjustEvent} from 'react-native-adjust';
import {AdjustOaid} from 'react-native-adjust-oaid';
import Config from 'react-native-config';

import {Initializable} from '@app/helpers/initializable';
import {AppStore} from '@app/models/app';
import {Wallet} from '@app/models/wallet';
import {MarketingEvents} from '@app/types';
import {getAppTrackingAuthorizationStatus} from '@app/utils';
import {IS_ANDROID} from '@app/variables/common';

const logger = Logger.create('EventTracker');

const DISABLED = __DEV__ || AppStore.isDetoxRunning;

const EventsNameMap: Record<MarketingEvents, string> = {
  [MarketingEvents.accountCreated]: 'account created',
  [MarketingEvents.accountAdded]: 'account added',
  [MarketingEvents.accountImported]: 'account imported',
  [MarketingEvents.accountRestored]: 'account restored',
  [MarketingEvents.backupCompleted]: 'backup completed',
  [MarketingEvents.sendFund]: 'send fund',
  [MarketingEvents.pushNotifications]: 'push notifications',
  [MarketingEvents.pushChannelSubscribe]: 'push channel subscribe',
  [MarketingEvents.pushChannelUnsubscribe]: 'push channel unsubscribe',
  [MarketingEvents.newsOpenItem]: 'news open item',
  [MarketingEvents.newsOpenLink]: 'news open link',
  [MarketingEvents.newsScrolledItem]: 'news scrolled item',
  [MarketingEvents.newsOpenOnboardingItem]: 'news open onboarding item',
  [MarketingEvents.newsOpenOnboardingLink]: 'news open onboarding link',
  [MarketingEvents.newsScrolledOnboardingItem]: 'news scrolled onboarding item',
  [MarketingEvents.newsOpenPushItem]: 'news open push item',
  [MarketingEvents.newsOpenPushLink]: 'news open push link',
  [MarketingEvents.newsScrolledPushItem]: 'news scrolled push item',
  [MarketingEvents.newsOpen]: 'news open',
  [MarketingEvents.earnOpen]: 'earn open',
  [MarketingEvents.browserOpen]: 'browser open',
  [MarketingEvents.governanceOpen]: 'governance open',
  [MarketingEvents.settingsOpen]: 'settings open',
  [MarketingEvents.claimOpened]: 'claim opened',
  [MarketingEvents.claimFetched]: 'claim fetched',
  [MarketingEvents.claimCreated]: 'claim created',
  [MarketingEvents.claimFailed]: 'claim failed',
  [MarketingEvents.settingsAccountDetails]: 'settings account details',
  [MarketingEvents.stakingOpen]: 'staking open',
  [MarketingEvents.stakingDelegate]: 'staking delegate',
  [MarketingEvents.stakingValidators]: 'staking validators',
  [MarketingEvents.jailed]: 'jailed',
  [MarketingEvents.storyOpen]: 'story opened',
  [MarketingEvents.storySkip]: 'story skipped',
  [MarketingEvents.storyFinished]: 'story finished',
  [MarketingEvents.storyAction]: 'story button pressed',
  [MarketingEvents.signTxStart]: 'sign tx start',
  [MarketingEvents.signTxSuccess]: 'sign tx success',
  [MarketingEvents.signTxFail]: 'sign tx fail',
  [MarketingEvents.sendTxStart]: 'send tx start',
  [MarketingEvents.sendTxSuccess]: 'send tx success',
  [MarketingEvents.sendTxFail]: 'send tx fail',
  [MarketingEvents.appStarted]: 'app started',
  [MarketingEvents.navigation]: 'navigation',
  [MarketingEvents.bannerClicked]: 'banner clicked',
  [MarketingEvents.swapStart]: 'swap start',
  [MarketingEvents.swapSuccess]: 'swap success',
  [MarketingEvents.swapFail]: 'swap fail',
  [MarketingEvents.swapScreenOpen]: 'swap screen open',
  [MarketingEvents.swapSelectToken0]: 'swap select token 0',
  [MarketingEvents.swapSelectToken1]: 'swap select token 1',
  [MarketingEvents.swapEnterAmount]: 'swap enter amount',
  [MarketingEvents.swapPressMax]: 'swap press max',
  [MarketingEvents.swapChangeDirection]: 'swap change direction',
  [MarketingEvents.swapApproveStart]: 'swap approve start',
  [MarketingEvents.swapApproveSuccess]: 'swap approve success',
  [MarketingEvents.swapApproveFail]: 'swap approve fail',
  [MarketingEvents.swapScreenClose]: 'swap screen close',
  [MarketingEvents.jsonRpcSignStart]: 'sign operation start',
  [MarketingEvents.jsonRpcSignSuccess]: 'sign operation success',
  [MarketingEvents.jsonRpcSignFail]: 'sign operation fail',
  [MarketingEvents.jsonRpcSignUserReject]: 'sign operation user reject',
  [MarketingEvents.exportWalletFail]: 'export wallet fail',
  [MarketingEvents.exportWalletStart]: 'export wallet start',
  [MarketingEvents.exportWalletSuccess]: 'export wallet success',
  [MarketingEvents.installHaqqabi]: 'install haqqabi',
};

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
      return;
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

  async getAdid(type: 'adjust' | 'posthog' = 'posthog'): Promise<string> {
    switch (type) {
      case 'adjust':
        return await this.getAdjustAdid();
      case 'posthog':
      default:
        return await this.getPosthogAdid();
    }
  }

  async setPushToken(token: string) {
    if (DISABLED) {
      return;
    }
    await this.awaitForInitialization();
    this.adjust.setPushToken(token);
    this.posthog?.identify(this.posthog.getDistinctId(), {
      push_token: token,
      wallets: Wallet.addressList(),
    });
  }

  dispose() {
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
    const eventName = EventsNameMap[event] ?? event ?? 'unknown';
    this._posthog?.capture(eventName, {...params});
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
      if (AppStore.isDeveloperModeEnabled) {
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
