import React, {useCallback, useState} from 'react';

import {SettingsAccountStyle} from '@app/components/settings-account-style';
import {useWallet} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks';
import {useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {WalletCardPattern, WalletCardStyle} from '@app/types';

export const SettingsAccountStyleScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'settingsAccountStyle'>();

  const wallet = useWallet(route.params.address) as Wallet;
  const [pattern, setPattern] = useState<string>(wallet.pattern);

  const [cardStyle, setCardStyle] = useState<WalletCardStyle>(
    wallet.cardStyle ?? WalletCardStyle.flat,
  );

  const [colors, setColors] = useState([
    wallet.colorFrom,
    wallet.colorTo,
    wallet.colorPattern,
  ]);

  const [patternStyle, setPatternStyle] = useState<WalletCardPattern>(
    wallet.pattern.startsWith(WalletCardPattern.circle)
      ? WalletCardPattern.circle
      : WalletCardPattern.rhombus,
  );

  const onPressApply = useCallback(() => {
    wallet.setCardStyle(cardStyle, colors[0], colors[1], colors[2], pattern);
    navigation.goBack();
  }, [cardStyle, colors, navigation, wallet, pattern]);

  return (
    <SettingsAccountStyle
      setPattern={setPattern}
      onPressApply={onPressApply}
      patternStyle={patternStyle}
      colors={colors}
      cardStyle={cardStyle}
      pattern={pattern}
      setPatternStyle={setPatternStyle}
      setColors={setColors}
      setCardStyle={setCardStyle}
      wallet={wallet}
    />
  );
};
