import React, {useCallback, useMemo} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {Image, StyleProp, ViewStyle} from 'react-native';

import {DataContent, MenuNavigationButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export interface WalletConnectAppRowProps {
  item: SessionTypes.Struct;
  style?: StyleProp<ViewStyle>;

  onPress?(item: SessionTypes.Struct): void;
}

export const WalletConnectAppRow = ({
  item,
  onPress,
  style,
}: WalletConnectAppRowProps) => {
  const application = useMemo(
    () => item?.peer?.metadata,
    [item?.peer?.metadata],
  );
  const imageSource = useMemo(
    () => ({uri: application?.icons?.[0]}),
    [application?.icons],
  );

  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  const subtitleProps = useMemo(() => ({numberOfLines: 1}), []);

  return (
    <MenuNavigationButton onPress={handlePress} style={style}>
      <Image style={styles.appIcon} source={imageSource} />
      <DataContent
        style={styles.info}
        title={application.name}
        subtitle={application.description}
        subtitleProps={subtitleProps}
      />
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  appIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
});
