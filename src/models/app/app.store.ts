import appleAuth from '@invertase/react-native-apple-authentication';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {makeAutoObservable, runInAction} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';
import {Platform} from 'react-native';
import Config from 'react-native-config';

import {storage} from '@app/services/mmkv';
import {RemoteConfig} from '@app/services/remote-config';

class AppStore {
  // App session properties
  private _isInitialized = false;
  private _isChecksCompleted = false;
  private _googleSigninSupported: boolean = false;

  // Hydrated properties
  private _isOnboarded = false;
  private _networkLoggerEnabled = false;
  private _networkLogsCacheSize = 500; // count of stored http request
  private _testnetsEnabledForAllNetworks = true;
  isDeveloperModeEnabled = Config.IS_DEVELOPMENT === 'true';
  isTesterModeEnabled = Config.IS_TESTMODE === 'true';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: [
        // @ts-ignore
        '_isOnboarded',
        'isDeveloperModeEnabled',
        'isTesterModeEnabled',
        // @ts-ignore
        '_networkLoggerEnabled',
        // @ts-ignore
        '_testnetsEnabledForAllNetworks',
        // @ts-ignore
        '_networkLogsCacheSize',
      ],
      storage,
    });

    GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: false}).then(
      (result: boolean) => {
        runInAction(() => {
          this._googleSigninSupported = result;
          this._isChecksCompleted = true;
        });
      },
    );
  }

  get isOnboarded() {
    return this._isOnboarded;
  }
  set isOnboarded(value: boolean) {
    runInAction(() => {
      this._isOnboarded = value;
    });
  }

  get isInitialized() {
    return isHydrated(this) && this._isInitialized && this._isChecksCompleted;
  }
  set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  get isAdditionalFeaturesEnabled() {
    return this.isDeveloperModeEnabled || this.isTesterModeEnabled;
  }
  get isLogsEnabled() {
    return __DEV__ || this.isAdditionalFeaturesEnabled;
  }

  get networkLoggerEnabled() {
    // only for developer mode
    if (!this.isAdditionalFeaturesEnabled) {
      return false;
    }
    return this._networkLoggerEnabled ?? false;
  }
  set networkLoggerEnabled(value: boolean) {
    runInAction(() => {
      this._networkLoggerEnabled = value;
    });
  }

  get networkLogsCacheSize() {
    return this._networkLogsCacheSize;
  }
  set networkLogsCacheSize(value: number) {
    runInAction(() => {
      this._networkLogsCacheSize = value;
    });
  }

  get testnetsEnabledForAllNetworks() {
    return this._testnetsEnabledForAllNetworks;
  }
  set testnetsEnabledForAllNetworks(value: boolean) {
    runInAction(() => {
      this._testnetsEnabledForAllNetworks = value;
    });
  }

  get isGoogleSigninSupported() {
    return (
      Boolean(RemoteConfig.get('sss_google_provider')) &&
      this._googleSigninSupported
    );
  }
  get isAppleSigninSupported() {
    const isApple =
      Platform.select({
        android: false,
        ios: appleAuth.isSupported,
      }) || false;

    return Boolean(RemoteConfig.get('sss_apple_provider')) && isApple;
  }
  get isCustomSigninSupported() {
    return Boolean(RemoteConfig.get('sss_custom_provider'));
  }
  get isOauthEnabled() {
    return (
      this.isDeveloperModeEnabled ||
      this.isGoogleSigninSupported ||
      this.isCustomSigninSupported ||
      this.isAppleSigninSupported
    );
  }
}

const instance = new AppStore();
export {instance as AppStore};
