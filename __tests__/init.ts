jest.mock('react-native-reanimated', () => {
  return {
    Easing: {
      bezierFn: jest.fn,
    },
  };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.NativeModules.RNVersion = {
    appVersion: jest.fn(),
    buildNumber: jest.fn(),
  };

  return RN;
});
