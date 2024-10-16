import {WalletCardPattern, WalletCardStyle} from '@app/types';
import {generateFlatColors, generateGradientColors} from '@app/utils';
import {
  CARD_CIRCLE_TOTAL,
  CARD_RHOMBUS_TOTAL,
  FLAT_PRESETS,
  GRADIENT_PRESETS,
} from '@app/variables/common';

import {IWalletModel} from './wallet.types';

export const getWalletCardStyle = (cardStyle?: WalletCardStyle) => {
  const cards = Object.keys(WalletCardStyle);
  return (
    cardStyle ??
    (cards[Math.floor(Math.random() * cards.length)] as WalletCardStyle)
  );
};

export const getWalletPattern = (pattern?: string) => {
  const patterns = Object.keys(WalletCardPattern);
  const patternVariant = patterns[Math.floor(Math.random() * patterns.length)];

  return (
    pattern ??
    `card-${patternVariant}-${Math.floor(
      Math.random() *
        (patternVariant === WalletCardPattern.circle
          ? CARD_CIRCLE_TOTAL
          : CARD_RHOMBUS_TOTAL),
    )}`
  );
};

type WalletColors = {
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
};
export const getWalletColors = (
  wallets: IWalletModel[],
  cardStyle: WalletCardStyle,
  walletColors: Partial<WalletColors>,
): WalletColors => {
  const usedColors = new Set(wallets.map(w => w.colorFrom));

  let availableColors = (
    cardStyle === WalletCardStyle.flat ? FLAT_PRESETS : GRADIENT_PRESETS
  ).filter(c => !usedColors.has(c[0]));

  let colors: string[];

  if (availableColors.length) {
    colors =
      availableColors[Math.floor(Math.random() * availableColors.length)];
  } else {
    colors =
      cardStyle === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();
  }

  return {
    colorFrom: walletColors?.colorFrom ?? colors[0],
    colorTo: walletColors?.colorTo ?? colors[1],
    colorPattern: walletColors?.colorPattern ?? colors[2],
  };
};
