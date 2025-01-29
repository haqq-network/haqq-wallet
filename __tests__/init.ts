jest.autoMockOn();
jest.enableAutomock();
jest.mock('react-native-reanimated', () => {
  return {
    Easing: {
      bezierFn: jest.fn,
    },
    useAnimatedStyle: jest.fn,
  };
});

jest.mock('react-native', () => {
  return {
    StyleSheet: {
      create: jest.fn,
    },
    Platform: {select: jest.fn},
    NativeModules: {
      RNVersion: {
        appVersion: jest.fn(),
        buildNumber: jest.fn(),
      },
    },
  };
});

jest.mock('@react-native-firebase/messaging', jest.fn);
jest.mock('react-native-adjust', () => {
  return {
    Adjust: jest.fn,
  };
});
jest.mock('@invertase/react-native-apple-authentication', () => {
  return {
    appleAuth: jest.fn,
  };
});
jest.mock('@react-native-firebase/dynamic-links', jest.fn);
jest.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSignin: jest.fn,
  };
});
jest.mock('react-native-keychain', jest.fn);
jest.mock('react-native-touch-id', jest.fn);
jest.mock('react-native-encrypted-storage', jest.fn);
class StaticJsonRpcProvider {
  constructor() {
    jest.fn();
  }
}

jest.mock('ethers', () => ({
  BigNumber: jest.fn,
  ethers: {
    providers: {StaticJsonRpcProvider: StaticJsonRpcProvider},
  },
}));
jest.mock('date-fns', () => ({
  subMinutes: jest.fn,
}));
jest.mock('realm', () => {
  return {
    Object: null,
  };
});

jest.mock('@evmos/provider', () => {
  return {
    a: null,
  };
});

jest.mock('@evmos/transactions', () => {
  return {
    a: null,
  };
});
jest.mock('bech32-converting', jest.fn);

//@ts-ignore
global.Logger = {
  create: jest.fn,
};
//@ts-ignore
global.Realm = {
  Object: null,
};
jest.mock('react-native-fs', jest.fn);
jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: jest.fn,
}));
jest.mock('react-native-ble-plx', () => ({
  State: jest.fn,
}));
jest.mock('@haqq/rn-wallet-providers', () => ({
  utils: {
    getBleManager: jest.fn,
  },
  ProviderMnemonicBase: jest.fn,
  ProviderMnemonicEvm: jest.fn,
  ProviderSSSBase: jest.fn,
  ProviderSSSEvm: jest.fn,
  ProviderHotBase: jest.fn,
  ProviderHotEvm: jest.fn,
}));
jest.mock('@react-native-async-storage/async-storage', jest.fn);
jest.mock('@haqq/shared-react-native', () => ({
  decryptPassworder: jest.fn,
  encryptPassworder: jest.fn,
}));
jest.mock('react-native-linear-gradient', jest.fn);
jest.mock('react-native-svg', () => ({
  Circle: null,
  Path: null,
}));
jest.mock('@react-native-clipboard/clipboard', jest.fn);
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: jest.fn,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn,
}));
