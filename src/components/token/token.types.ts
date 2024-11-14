import {IToken} from '@app/types';

export type TokenRowProps = {
  item: IToken;
  checked?: boolean;
  onPress?: () => void;
};

export type TokenIconProps = {
  item: IToken;
};
