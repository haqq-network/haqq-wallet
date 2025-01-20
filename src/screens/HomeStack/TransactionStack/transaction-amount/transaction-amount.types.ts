import {ViewStyle} from 'react-native';

export type TransactionAmountInputFromProps = {
  alignItems?: ViewStyle['alignItems'];
  error: string;
  setError: (error: string) => void;
};

export type TransactionAmountInputToProps = {
  alignItems?: ViewStyle['alignItems'];
};
