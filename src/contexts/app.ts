import {
  ENVIRONMENT,
  HAQQ_BACKEND,
  HAQQ_BACKEND_DEFAULT,
  IS_DEVELOPMENT,
} from '@env';
import {decryptPassworder, encryptPassworder} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {subMinutes} from 'date-fns';
import {AppState, Appearance, Platform, StatusBar} from 'react-native';
import Keychain, {
  STORAGE_TYPE,
  getGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import TouchID from 'react-native-touch-id';

import {DEBUG_VARS} from '@app/debug-vars';
import {onUpdatesSync} from '@app/event-actions/on-updates-sync';
import {getEmptyBalances} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {AsyncEventEmitter} from '@app/helpers/async-event-emitter';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {checkNeedUpdate} from '@app/helpers/check-app-version';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {getUid} from '@app/helpers/get-uid';
import {SecurePinUtils} from '@app/helpers/secure-pin-utils';
import {Currencies} from '@app/models/currencies';
import {seedData} from '@app/models/seed-data';
import {Token} from '@app/models/tokens';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {VestingMetadataType} from '@app/models/vesting-metadata';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {RemoteConfig} from '@app/services/remote-config';
import {SystemDialog} from '@app/services/system-dialog';

import {showModal} from '../helpers';
import {Provider} from '../models/provider';
import {User} from '../models/user';
import {
  AppLanguage,
  AppTheme,
  BalanceData,
  BiometryType,
  DynamicLink,
  HaqqEthereumAddress,
  IndexerBalanceData,
  ModalType,
} from '../types';
import {
  LIGHT_GRAPHIC_GREEN_1,
  MAINNET_ETH_CHAIN_ID,
  MAIN_NETWORK_ID,
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
  private _balances: Map<HaqqEthereumAddress, BalanceData> = new Map();
  private _balance: Map<string, Balance> = new Map();
  private _stakingBalance: Map<string, Balance> = new Map();
  private _vestingBalance: Map<string, Record<VestingMetadataType, Balance>> =
    new Map();
  private _googleSigninSupported: boolean = false;
  private _appleSigninSupported: boolean =
    Platform.select({
      android: false,
      ios: appleAuth.isSupported,
    }) || false;
  private _systemTheme: AppTheme = Appearance.getColorScheme() as AppTheme;

  constructor() {
    super();
    this._startUpTime = Date.now();

    seedData();

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

    this._provider = Provider.getById(this.providerId);

    if (this._provider) {
      EthNetwork.init(this._provider);
    }

    this.checkBalance = this.checkBalance.bind(this);
    this.checkBalance();
    setInterval(this.checkBalance, 6000);

    this.handleDynamicLink = this.handleDynamicLink.bind(this);

    dynamicLinks().onLink(this.handleDynamicLink);
    dynamicLinks().getInitialLink().then(this.handleDynamicLink);

    this.listenTheme = this.listenTheme.bind(this);

    Appearance.addChangeListener(this.listenTheme);
    AppState.addEventListener('change', this.listenTheme);
    this.listenTheme();
    AppState.addEventListener('change', this.onAppStatusChanged.bind(this));

    if (!VariablesBool.exists('isDeveloper')) {
      VariablesBool.set('isDeveloper', IS_DEVELOPMENT === 'true');
    }
    this.setEnabledLoggersForTestMode(this.isTesterMode);
  }

  private _startUpTime: number;

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
      Boolean(RemoteConfig.get('sss_google')) && this._googleSigninSupported
    );
  }

  get isAppleSigninSupported() {
    return Boolean(RemoteConfig.get('sss_apple')) && this._appleSigninSupported;
  }

  get isCustomSigninSupported() {
    return Boolean(RemoteConfig.get('sss_custom'));
  }

  get isOathSigninSupported() {
    return (
      this.isGoogleSigninSupported ||
      this.isCustomSigninSupported ||
      this.isAppleSigninSupported ||
      this.isDeveloper
    );
  }

  private _provider: Provider | null;

  get provider() {
    return this._provider as Provider;
  }

  get providerId() {
    return (
      VariablesString.get('providerId') ??
      (ENVIRONMENT === 'production' || ENVIRONMENT === 'distribution'
        ? MAIN_NETWORK_ID
        : MAIN_NETWORK_ID)
    );
  }

  set providerId(value) {
    const p = Provider.getById(value);
    if (p) {
      VariablesString.set('providerId', value);
      this._provider = p;
      EthNetwork.init(p);
      app.emit(Events.onProviderChanged);
    } else {
      throw new Error('Provider not found');
    }
  }

  get cosmos() {
    return new Cosmos(app.provider);
  }

  get backend() {
    if (!VariablesString.exists('backend')) {
      return HAQQ_BACKEND_DEFAULT || HAQQ_BACKEND;
    }

    return (
      VariablesString.get('backend') || HAQQ_BACKEND_DEFAULT || HAQQ_BACKEND
    );
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

  get language() {
    return (VariablesString.get('language') as AppLanguage) || AppLanguage.en;
  }

  set language(value) {
    VariablesString.set('language', value);
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
    return (
      (VariablesBool.get('isTesterMode') ?? false) &&
      this.provider.ethChainId !== MAINNET_ETH_CHAIN_ID
    );
  }

  set isTesterMode(value) {
    this.onTesterModeChange(value);
    VariablesBool.set('isTesterMode', value);
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

    await this.auth();

    await awaitForEventDone(Events.onWalletsBalanceCheck);

    this.authenticated = true;

    this.appStatus = getAppStatus();

    return Promise.resolve();
  }

  async getPassword() {
    const creds = await getGenericPassword();
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
    if (this.canEnter) {
      const password = await this.getPassword();
      return password === pin ? Promise.resolve() : Promise.reject();
    }

    return Promise.reject();
  }

  async auth() {
    this.resetAuth();
    await SystemDialog.getResult(async () => {
      const close = showModal('pin');
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
    });
  }

  async makeBiometryAuth() {
    if (this.biometry && !this.pinBanned) {
      try {
        await this.biometryAuth();
        vibrate(HapticEffects.success);
        this.authenticated = true;
      } catch (error) {
        Logger.error('app.auth', error);
        await awaitForEventDone(Events.enterPinSuccess);
      }
    } else {
      await awaitForEventDone(Events.enterPinSuccess);
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
    return new Promise<void>(async (resolve, _reject) => {
      const password = await this.getPassword();

      const callback = (value: string) => {
        if (password === value) {
          this.off('enterPin', callback);
          this.emit(Events.enterPinSuccess);
          resolve();
        } else {
          this.emit('errorPin', 'not match');
        }
      };

      this.on('enterPin', callback);
    });
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
    if (this.appStatus !== appStatus) {
      switch (appStatus) {
        case AppStatus.active:
          if (this.user?.isOutdatedLastActivity() && this.authenticated) {
            this.authenticated = false;
            await this.auth();
          }
          await awaitForEventDone(Events.onAppActive);
          await onUpdatesSync();
          RemoteConfig.init(true);
          await RemoteConfig.awaitForInitialization();
          break;
        case AppStatus.inactive:
          if (this.authenticated) {
            this.user?.touchLastActivity();
          }
          break;
      }

      this.appStatus = appStatus;
    }
  }

  checkBalance() {
    if (AppState.currentState === 'active') {
      this.emit(Events.onWalletsBalanceCheck);
    }
  }

  onWalletsBalance(balances: IndexerBalanceData) {
    let changed = false;

    const balancesEntries = Object.entries(balances) as unknown as [
      HaqqEthereumAddress,
      BalanceData,
    ][];

    for (const [address, data] of balancesEntries) {
      const prevBalance = this._balances.get(address);

      if (
        !prevBalance?.available?.compare(data.available, 'eq') ||
        !prevBalance?.staked?.compare(data.staked, 'eq') ||
        !prevBalance?.vested?.compare(data.vested, 'eq') ||
        !prevBalance?.total?.compare(data.total, 'eq') ||
        !prevBalance?.locked?.compare(data.locked, 'eq') ||
        !prevBalance?.availableForStake?.compare(data.availableForStake, 'eq')
      ) {
        this._balances.set(address, data);
        changed = true;
      }
    }

    if (changed) {
      Token.fetchTokens();
      this.emit(Events.onBalanceSync);
    }
  }

  getBalanceData(address: string) {
    return (
      this._balances.get(AddressUtils.toEth(address)) ||
      getEmptyBalances()[AddressUtils.toEth(address)]
    );
  }

  getAvailableBalance(address: string): Balance {
    return (
      this._balances.get(AddressUtils.toEth(address))?.available ??
      Balance.Empty
    );
  }

  getAvailableForStakeBalance(address: string): Balance {
    return (
      this._balances.get(AddressUtils.toEth(address))?.availableForStake ??
      Balance.Empty
    );
  }

  getStakingBalance(address: string): Balance {
    return (
      this._balances.get(AddressUtils.toEth(address))?.staked ?? Balance.Empty
    );
  }

  getVestingBalance(address: string): Balance {
    return (
      this._balances.get(AddressUtils.toEth(address))?.vested ?? Balance.Empty
    );
  }

  getTotalBalance(address: string): Balance {
    return (
      this._balances.get(AddressUtils.toEth(address))?.total ?? Balance.Empty
    );
  }

  getLockedBalance(address: string): Balance {
    return (
      this._balances.get(AddressUtils.toEth(address))?.locked ?? Balance.Empty
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
    return await getRpcProvider(this.provider);
  }

  resetAuth() {
    this.authenticated = false;
  }
}

export const app = new App();
