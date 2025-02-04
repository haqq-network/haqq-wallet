import {decryptPassworder, encryptPassworder} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {subMinutes} from 'date-fns';
import {Alert, AppState, Appearance, Platform, StatusBar} from 'react-native';
import Keychain, {
  STORAGE_TYPE,
  getGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';

import {DEBUG_VARS} from '@app/debug-vars';
import {onAppReset} from '@app/event-actions/on-app-reset';
import {onUpdatesSync} from '@app/event-actions/on-updates-sync';
import {Events} from '@app/events';
import {AsyncEventEmitter} from '@app/helpers/async-event-emitter';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {checkNeedUpdate} from '@app/helpers/check-app-version';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {getUid} from '@app/helpers/get-uid';
import {SecurePinUtils} from '@app/helpers/secure-pin-utils';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Currencies} from '@app/models/currencies';
import {Provider, RemoteProviderConfig} from '@app/models/provider';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Backend} from '@app/services/backend';
import {Cosmos} from '@app/services/cosmos';
import {EventTracker} from '@app/services/event-tracker';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {RemoteConfig} from '@app/services/remote-config';

import {showModal} from '../helpers';
import {User} from '../models/user';
import {
  AppTheme,
  BiometryType,
  DynamicLink,
  MarketingEvents,
  ModalType,
} from '../types';
import {
  LIGHT_GRAPHIC_GREEN_1,
  SHOW_NON_WHITELIST_TOKEN,
} from '../variables/common';

const optionalConfigObject = {
  title: 'Fingerprint Login', // Android
  imageColor: LIGHT_GRAPHIC_GREEN_1,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

const isSupportedConfig = {
  unifiedErrors: false,
};

enum AppStatus {
  inactive,
  active,
}

function getAppStatus() {
  return AppState.currentState === 'active'
    ? AppStatus.active
    : AppStatus.inactive;
}

class App extends AsyncEventEmitter {
  private user: User;
  private _authenticated: boolean = DEBUG_VARS.enableSkipPinOnLogin;
  private appStatus: AppStatus = AppStatus.inactive;
  private _googleSigninSupported: boolean = false;
  private _appleSigninSupported: boolean =
    Platform.select({
      android: false,
      ios: appleAuth.isSupported,
    }) || false;
  private _systemTheme: AppTheme = Appearance.getColorScheme() as AppTheme;
  public passwordCorrupted: boolean = false;

  constructor() {
    super();
    this.startInitialization();
    this.setMaxListeners(1000);
    this._startUpTime = Date.now();

    TouchID.isSupported(isSupportedConfig)
      .then(biometryType => {
        this._biometryType =
          Platform.select({
            ios: biometryType as BiometryType,
            android: biometryType ? BiometryType.fingerprint : null,
          }) || null;
      })
      .catch(() => {
        this._biometryType = null;
      });

    GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: false}).then(
      (result: boolean) => {
        this._googleSigninSupported = result;
      },
    );

    this.user = User.getOrCreate();

    Provider.init()
      .then(RemoteProviderConfig.init)
      .then(() => {
        EthNetwork.init(Provider.selectedProvider);

        this.checkBalance();

        this.handleDynamicLink = this.handleDynamicLink.bind(this);

        dynamicLinks().onLink(this.handleDynamicLink);
        dynamicLinks().getInitialLink().then(this.handleDynamicLink);

        this.listenTheme = this.listenTheme.bind(this);

        Appearance.addChangeListener(this.listenTheme);
        AppState.addEventListener('change', this.listenTheme);
        this.listenTheme();
        AppState.addEventListener('change', this.onAppStatusChanged.bind(this));

        this.setEnabledLoggersForTestMode();
        this.stopInitialization();
      });
  }

  private _startUpTime: number;
  /**
   * NOTE: This flag is only used for Biometric unlock in onAppStateChanged callback
   *
   * @private
   * @type {boolean}
   */
  private _authInProgress: boolean = false;

  set authenticated(value: boolean) {
    this._authenticated = value;
    this.emit(Events.onAuthenticatedChanged, value);
  }

  get authenticated() {
    return this._authenticated;
  }

  get startUpTime() {
    return this._startUpTime;
  }

  private _biometryType: BiometryType | null = null;

  get biometryType() {
    return this._biometryType;
  }

  get isGoogleSigninSupported() {
    return (
      Boolean(RemoteConfig.get('sss_google_provider')) &&
      this._googleSigninSupported
    );
  }

  get isAppleSigninSupported() {
    return (
      Boolean(RemoteConfig.get('sss_apple_provider')) &&
      this._appleSigninSupported
    );
  }

  get isCustomSigninSupported() {
    return IS_DETOX;
  }

  get isOathSigninSupported() {
    return (
      this.isGoogleSigninSupported ||
      this.isCustomSigninSupported ||
      this.isAppleSigninSupported ||
      AppStore.isDeveloperModeEnabled
    );
  }

  get cosmos() {
    return new Cosmos(Provider.selectedProvider);
  }

  get backend() {
    return Backend.instance.getRemoteUrl();
  }

  set backend(value) {
    VariablesString.set('backend', value);
  }

  get biometry() {
    return VariablesBool.get('biometry') || false;
  }

  set biometry(value) {
    VariablesBool.set('biometry', value);
  }

  get isUnlocked() {
    return this.authenticated || false;
  }

  get bluetooth() {
    return VariablesBool.get('bluetooth') || false;
  }

  set bluetooth(value) {
    VariablesBool.set('bluetooth', value);
  }

  get hasNotifications() {
    return this.notifications && this.notificationToken !== '';
  }

  get notifications() {
    return VariablesBool.get('notifications') || false;
  }

  set notifications(value) {
    VariablesBool.set('notifications', value);
  }

  get notificationToken() {
    return VariablesString.get('notificationToken') ?? '';
  }

  set notificationToken(value: string) {
    VariablesString.set('notificationToken', value);
  }

  get snoozeBackup(): Date {
    return this.user?.snoozeBackup || subMinutes(new Date(), 1);
  }

  get canEnter() {
    return this.user?.canEnter;
  }

  get pinBanned() {
    return this.user?.pinBanned;
  }

  get pinAttempts() {
    return this.user?.pinAttempts ?? 0;
  }

  get showNonWhitlistedTokens() {
    return (
      (AppStore.isTesterModeEnabled &&
        VariablesBool.get(SHOW_NON_WHITELIST_TOKEN)) ??
      false
    );
  }

  get blindSignEnabled() {
    return VariablesBool.get('blindSignEnabled') ?? false;
  }

  set blindSignEnabled(value: boolean) {
    VariablesBool.set('blindSignEnabled', value);
  }

  get currentTheme() {
    return this.theme === AppTheme.system
      ? this._systemTheme ?? AppTheme.light
      : this.theme;
  }

  get theme() {
    return (VariablesString.get('theme') as AppTheme) || AppTheme.system;
  }

  set theme(value) {
    VariablesString.set('theme', value);

    this.emit(Events.onThemeChanged, value);

    if (AppTheme.system === value) {
      const scheme = this._systemTheme;
      StatusBar.setBarStyle(
        scheme === 'light' ? 'dark-content' : 'light-content',
        false,
      );
    } else {
      StatusBar.setBarStyle(
        value === AppTheme.dark ? 'light-content' : 'dark-content',
        false,
      );
    }
  }

  onTesterModeChange(value: boolean) {
    this.setEnabledLoggersForTestMode();
    this.emit(Events.onTesterModeChanged, value);
  }

  setEnabledLoggersForTestMode() {
    if (!__DEV__) {
      DEBUG_VARS.enableWeb3BrowserLogger = AppStore.isTesterModeEnabled;
      DEBUG_VARS.enableWalletConnectLogger = AppStore.isTesterModeEnabled;
      DEBUG_VARS.enableAwaitJsonRpcSignLogger = AppStore.isTesterModeEnabled;
    }
  }

  listenTheme() {
    const systemColorScheme = Appearance.getColorScheme() as AppTheme;

    if (getAppStatus() === AppStatus.inactive) {
      return;
    }

    if (systemColorScheme !== this._systemTheme) {
      this._systemTheme = systemColorScheme;
      this.emit(Events.onThemeChanged, systemColorScheme);
    }

    StatusBar.setBarStyle(
      this.currentTheme === AppTheme.light ? 'dark-content' : 'light-content',
      false,
    );
  }

  async init(): Promise<void> {
    if (!Wallet.getAll().length) {
      return Promise.resolve();
    }

    let shouldSkipAuth = false;
    try {
      await this.getPassword();
    } catch (err) {
      if (err === 'password_migration_not_possible') {
        shouldSkipAuth = true;
      }
      if (err === 'password_not_migrated') {
        app.successEnter();
        app.passwordCorrupted = true;
      }
    } finally {
      if (!shouldSkipAuth) {
        await this.auth();
      }
    }

    Wallet.fetchBalances();

    this.authenticated = true;

    this.appStatus = getAppStatus();

    return Promise.resolve();
  }

  async getPassword(): Promise<string> {
    const creds = await getGenericPassword();

    // Detect keychain migration
    if (creds) {
      let passwordEntity = null;
      try {
        passwordEntity = JSON.parse(creds.password);
      } catch {}
      // If we can't parse entity or we have invalid fiedls
      if (
        passwordEntity === null ||
        !passwordEntity?.cipher ||
        !passwordEntity?.iv ||
        !passwordEntity?.salt
      ) {
        Alert.alert(getText(I18N.keychainMigrationNotPossible));
        await onAppReset();
        return Promise.reject('password_migration_not_possible');
      }
    }

    if (!creds || !creds.password || creds.username !== this.user.uuid) {
      return Promise.reject('password_not_found');
    }

    const uid = await getUid();

    if (creds.password.length === 6) {
      creds.password = await this.setPin(creds.password);
    }

    const resp = await decryptPassworder<{password: string}>(
      uid,
      creds.password,
    );

    return resp.password;
  }

  async setPin(password: string) {
    const uid = await getUid();
    const pass = await encryptPassworder(uid, {password});

    await setGenericPassword(this.user.uuid, pass, {
      storage: STORAGE_TYPE.AES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    this.authenticated = true;
    Currencies.setSelectedCurrency();
    return pass;
  }

  async comparePin(pin: string) {
    const passwordsDoNotMatch = new Error('password_do_not_match');
    if (this.canEnter) {
      try {
        const password = await this.getPassword();
        return password === pin
          ? Promise.resolve()
          : Promise.reject(passwordsDoNotMatch);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(passwordsDoNotMatch);
  }

  async auth() {
    this.resetAuth();
    const close = showModal(ModalType.pin);
    if (SecurePinUtils.isPinChangedWithFail()) {
      try {
        await SecurePinUtils.rollbackPin();
        showModal(ModalType.pinError);
      } catch (e) {
        const details = (e as Error)?.message || e?.toString();
        showModal(ModalType.pinError, {details});
        Logger.error(e, 'app.auth rollback pin failed');
      }
    }
    await Promise.race([this.makeBiometryAuth(), this.makePinAuth()]);

    if (this.authenticated) {
      close();
    }
  }

  async makeBiometryAuth() {
    if (this.biometry && !this.pinBanned) {
      try {
        await this.biometryAuth();
        vibrate(HapticEffects.success);
        this.authenticated = true;
        return true;
      } catch (error) {
        Logger.error('app.auth', error);
        await awaitForEventDone(Events.enterPinSuccess);
        return false;
      }
    } else {
      await awaitForEventDone(Events.enterPinSuccess);
      return false;
    }
  }

  async makePinAuth() {
    if (!this.authenticated) {
      await this.pinAuth();
      this.authenticated = true;
    }
  }

  biometryAuth() {
    return TouchID.authenticate('', optionalConfigObject);
  }

  pinAuth() {
    return new Promise<boolean>(async (resolve, _reject) => {
      const callback = async (value: string) => {
        const password = await this.getPassword();
        if (password === value) {
          this.off('enterPin', callback);
          this.emit(Events.enterPinSuccess);
          resolve(true);
        } else {
          this.emit('errorPin', 'not match');
        }
      };

      this.on('enterPin', callback);
    });
  }

  async requsetPinConfirmation(): Promise<boolean> {
    const close = showModal(ModalType.pin);
    const confirmed = await Promise.race([
      this.makeBiometryAuth(),
      this.pinAuth(),
    ]);
    close();
    return confirmed;
  }

  successEnter() {
    return this.user?.successEnter();
  }

  failureEnter() {
    return this.user?.failureEnter();
  }

  getUser() {
    return this.user;
  }

  async onAppStatusChanged() {
    const appStatus = getAppStatus();
    if (this.appStatus !== appStatus && !this._authInProgress) {
      this.appStatus = appStatus;

      switch (appStatus) {
        case AppStatus.active:
          EventTracker.instance.trackEvent(MarketingEvents.appStarted, {
            type: 'background',
          });
          if (this.user?.isOutdatedLastActivity() && this.authenticated) {
            this.authenticated = false;
            this._authInProgress = true;
            await this.auth();
          }
          await awaitForEventDone(Events.onAppActive);
          await onUpdatesSync();
          RemoteConfig.init(true);
          await RemoteConfig.awaitForInitialization();
          this._authInProgress = false;
          await Provider.fetchProviders();
          break;
        case AppStatus.inactive:
          if (this.authenticated) {
            this.user?.touchLastActivity();
          }
          break;
      }
    }
  }

  checkBalance = () => {
    if (AppState.currentState === 'active') {
      Wallet.fetchBalances();
    }
  };

  handleDynamicLink(link: DynamicLink | null) {
    this.emit(Events.onDynamicLink, link);
  }

  checkUpdate() {
    if (checkNeedUpdate()) {
      this.emit(Events.onNeedUpdate);
    }
  }

  async rehydrateUserAttempts() {
    await this.user.rehydrate();
  }

  async getRpcProvider() {
    return await getRpcProvider(Provider.selectedProvider);
  }

  resetAuth() {
    this.authenticated = false;
  }
}

export const app = new App();
