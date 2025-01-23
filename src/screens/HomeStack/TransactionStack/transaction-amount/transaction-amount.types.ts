import {ViewStyle} from 'react-native';

export type TransactionAmountProps = {
  onPreviewPress: () => void;
};

export type TransactionAmountInputFromProps = {
  alignItems?: ViewStyle['alignItems'];
  error: string;
  setError: (error: string) => void;
};

export type TransactionAmountInputToProps = {
  alignItems?: ViewStyle['alignItems'];
};

export type TransactionAmountCrossChainSwapProvider = {
  id: number;
  title: string;
  impact: number;
};
