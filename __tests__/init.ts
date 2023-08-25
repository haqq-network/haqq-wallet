jest.mock('react-native-reanimated', () => {
  return {
    Easing: {
      bezierFn: jest.fn,
    },
  };
});
