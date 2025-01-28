import {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {splitAddress} from '@app/utils';

import {DataContent, DataContentProps, Text, TextPosition} from './ui';

type AddressHighlightProps = DataContentProps & {
  address: string;
  title: I18N;
  centered?: boolean;
};

export const AddressHighlight = ({
  address,
  title,
  centered,
  ...dataContentProps
}: AddressHighlightProps) => {
  const splitted = useMemo(() => splitAddress(address), [address]);

  const onPressAddress = useCallback(() => {
    Clipboard.setString(address);
    sendNotification(I18N.notificationCopied);
  }, [address]);

  const titlePosition: TextPosition = useMemo(
    () => (centered ? TextPosition.center : TextPosition.left),
    [centered],
  );
  const subTitlePosition = useMemo(
    () => (centered ? {alignItems: 'center'} : {alignItems: 'flex-start'}),
    [centered],
  );

  return (
    <DataContent
      {...dataContentProps}
      title={
        <Text position={titlePosition}>
          <Text>{splitted[0]}</Text>
          <Text color={Color.textBase2}>{splitted[1]}</Text>
          <Text>{splitted[2]}</Text>
        </Text>
      }
      numberOfLines={2}
      subtitleI18n={title}
      reversed
      short
      onPress={onPressAddress}
      style={{...styles.container, ...subTitlePosition} as ViewStyle}
    />
  );
};

const styles = createTheme({
  container: {flex: 0},
});
