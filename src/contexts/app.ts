import {decryptPassworder, encryptPassworder} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {subMinutes} from 'date-fns';
import {Alert, AppState, Appearance, Platform, StatusBar} from 'react-native';
import Config from 'react-native-config';
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
import {AddressUtils} from '@app/helpers/address-utils';
import {AsyncEventEmitter} from '@app/helpers/async-event-emitter';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {checkNeedUpdate} from '@app/helpers/check-app-version';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {getUid} from '@app/helpers/get-uid';
import {SecurePinUtils} from '@app/helpers/secure-pin-utils';
import {I18N, getText} from '@app/i18n';
import {Currencies} from '@app/models/currencies';
import {
  ALL_NETWORKS_ID,
  Provider,
  ProviderModel,
  RemoteProviderConfig,
} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {EventTracker} from '@app/services/event-tracker';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {RemoteConfig} from '@app/services/remote-config';

import {hideAll, showModal} from '../helpers';
import {User} from '../models/user';
import {
  AppTheme,
  BalanceData,
  BiometryType,
  ChainId,
  DynamicLink,
  HaqqEthereumAddress,
  IndexerBalanceData,
  MarketingEvents,
  ModalType,
  WalletType,
} from '../types';
import {LIGHT_GRAPHIC_GREEN_1} from '../variables/common';

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
  private _balances: Record<ChainId, Record<HaqqEthereumAddress, BalanceData>> =
    {};
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

        this.checkBalance = this.checkBalance.bind(this);
        this.checkBalance();

        this.handleDynamicLink = this.handleDynamicLink.bind(this);

        dynamicLinks().onLink(this.handleDynamicLink);
        dynamicLinks().getInitialLink().then(this.handleDynamicLink);

        this.listenTheme = this.listenTheme.bind(this);

        Appearance.addChangeListener(this.listenTheme);
        AppState.addEventListener('change', this.listenTheme);
        this.listenTheme();
        AppState.addEventListener('change', this.onAppStatusChanged.bind(this));

        if (!VariablesBool.exists('isDeveloper')) {
          VariablesBool.set('isDeveloper', Config.IS_DEVELOPMENT === 'true');
        }
        this.setEnabledLoggersForTestMode(this.isTesterMode);
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
    return Boolean(RemoteConfig.get('sss_custom_provider'));
  }

  get isOathSigninSupported() {
    return (
      this.isGoogleSigninSupported ||
      this.isCustomSigninSupported ||
      this.isAppleSigninSupported ||
      this.isDeveloper
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

  get onboarded() {
    return VariablesBool.get('onboarded') || false;
  }

  set onboarded(value) {
    this.emit(Events.onOnboardedChanged, value);
    VariablesBool.set('onboarded', value);
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

  get isDeveloper() {
    return VariablesBool.get('isDeveloper') ?? false;
  }

  set isDeveloper(value) {
    VariablesBool.set('isDeveloper', value);
  }

  get isTesterMode() {
    return VariablesBool.get('isTesterMode') ?? false;
  }

  set isTesterMode(value) {
    this.onTesterModeChange(value);
    VariablesBool.set('isTesterMode', value);
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
    this.setEnabledLoggersForTestMode(value);
    this.emit(Events.onTesterModeChanged, value);
  }

  setEnabledLoggersForTestMode(enabled: boolean) {
    if (!__DEV__) {
      DEBUG_VARS.enableWeb3BrowserLogger = enabled;
      DEBUG_VARS.enableWalletConnectLogger = enabled;
      DEBUG_VARS.enableAwaitJsonRpcSignLogger = enabled;
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
    if (!this.onboarded) {
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

    await awaitForEventDone(Events.onWalletsBalanceCheck);

    this.authenticated = true;

    this.appStatus = getAppStatus();

    return Promise.resolve();
  }

  private getWalletForPinRestore = () => {
    const possibleToRestoreWalletTypes = [
      WalletType.hot,
      WalletType.mnemonic,
      WalletType.sss,
    ];
    const possibleToRestoreWallet = Wallet.getAll().find(wallet =>
      possibleToRestoreWalletTypes.includes(wallet.type),
    );
    return possibleToRestoreWallet;
  };

  async getPassword(pinCandidate?: string): Promise<string> {
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
        Logger.error('iOS Keychain Migration Error Found:', creds);
        const walletToCheck = this.getWalletForPinRestore();
        // Save old biometry
        const biomentryMigrationKey = 'biometry_before_migration';
        if (!VariablesBool.exists(biomentryMigrationKey)) {
          VariablesBool.set(biomentryMigrationKey, this.biometry);
        }
        this.biometry = false;

        // Reset app if we have main Hardware Wallet
        if (!walletToCheck) {
          this.onboarded = false;
          await onAppReset();
          hideAll();
          Alert.alert(getText(I18N.keychainMigrationNotPossible));
          return Promise.reject('password_migration_not_possible');
        }

        if (!pinCandidate) {
          return Promise.reject('password_not_migrated');
        }

        // Try to verify old pin
        try {
          const isValid = await SecurePinUtils.checkPinCorrect(
            walletToCheck,
            pinCandidate,
          );
          if (isValid) {
            creds.password = await this.setPin(pinCandidate);
            const uid = await getUid();
            const resp = await decryptPassworder<{password: string}>(
              uid,
              creds.password,
            );

            this.biometry = VariablesBool.get(biomentryMigrationKey);
            VariablesBool.remove(biomentryMigrationKey);
            return resp.password;
          } else {
            app.failureEnter();
            return Promise.reject('password_migration_not_matched');
          }
        } catch (err) {
          Logger.error('iOS Keychain Migration Error:', err);
        }
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
        const password = await this.getPassword(pin);
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

  checkBalance() {
    if (AppState.currentState === 'active') {
      this.emit(Events.onWalletsBalanceCheck);
    }
  }

  onWalletsBalance(balances: IndexerBalanceData) {
    if (!this.onboarded) {
      return;
    }

    if (JSON.stringify(this._balances) !== JSON.stringify(balances)) {
      this._balances = balances;
      Token.fetchTokens();
      this.emit(Events.onBalanceSync);
    }
  }

  private _calculateAllNetworksBalance = (address: string) => {
    const getBalanceData = (p: ProviderModel) =>
      this._balances[p.ethChainId]?.[AddressUtils.toEth(address)] ||
      Balance.emptyBalances[AddressUtils.toEth(address)];

    return Provider.getAllNetworks().reduce(
      (acc, p) => {
        const {available, locked, staked, total, vested, availableForStake} =
          getBalanceData(p) ?? {};

        return {
          staked: acc.staked.operate(
            Currencies.convert(staked ?? Balance.Empty, p.ethChainId),
            'add',
          ),
          vested: acc.vested.operate(
            Currencies.convert(vested ?? Balance.Empty, p.ethChainId),
            'add',
          ),
          available: acc.available?.operate(
            Currencies.convert(available ?? Balance.Empty, p.ethChainId),
            'add',
          ),
          total: acc.total?.operate(
            Currencies.convert(total ?? Balance.Empty, p.ethChainId),
            'add',
          ),
          locked: acc.locked?.operate(
            Currencies.convert(locked ?? Balance.Empty, p.ethChainId),
            'add',
          ),
          availableForStake: acc.availableForStake?.operate(
            Currencies.convert(
              availableForStake ?? Balance.Empty,
              p.ethChainId,
            ),
            'add',
          ),
          unlock: acc.unlock,
        };
      },
      {
        staked: Balance.Empty,
        vested: Balance.Empty,
        available: Balance.Empty,
        total: Balance.Empty,
        locked: Balance.Empty,
        availableForStake: Balance.Empty,
        unlock: new Date(0),
      },
    );
  };

  getBalanceData(address: string) {
    if (Provider.selectedProviderId === ALL_NETWORKS_ID) {
      return this._calculateAllNetworksBalance(address);
    }

    return (
      this._balances[Provider.selectedProvider.ethChainId]?.[
        AddressUtils.toEth(address)
      ] || Balance.emptyBalances[AddressUtils.toEth(address)]
    );
  }

  getAvailableBalance(
    address: string,
    provider = Provider.selectedProvider,
  ): Balance {
    return (
      this._balances[provider.ethChainId]?.[AddressUtils.toEth(address)]
        ?.available ?? Balance.Empty
    );
  }

  getAvailableForStakeBalance(
    address: string,
    provider = Provider.selectedProvider,
  ): Balance {
    return (
      this._balances[provider.ethChainId]?.[AddressUtils.toEth(address)]
        ?.availableForStake ?? Balance.Empty
    );
  }

  getStakingBalance(
    address: string,
    provider = Provider.selectedProvider,
  ): Balance {
    return (
      this._balances[provider.ethChainId]?.[AddressUtils.toEth(address)]
        ?.staked ?? Balance.Empty
    );
  }

  getVestingBalance(
    address: string,
    provider = Provider.selectedProvider,
  ): Balance {
    return (
      this._balances[provider.ethChainId]?.[AddressUtils.toEth(address)]
        ?.vested ?? Balance.Empty
    );
  }

  getTotalBalance(
    address: string,
    provider = Provider.selectedProvider,
  ): Balance {
    return (
      this._balances[provider.ethChainId]?.[AddressUtils.toEth(address)]
        ?.total ?? Balance.Empty
    );
  }

  getLockedBalance(
    address: string,
    provider = Provider.selectedProvider,
  ): Balance {
    return (
      this._balances[provider.ethChainId]?.[AddressUtils.toEth(address)]
        ?.locked ?? Balance.Empty
    );
  }

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
