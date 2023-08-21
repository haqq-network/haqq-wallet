import React from 'react';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer, Text} from '@app/components/ui';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {Modals} from '@app/types';

export function LockedTokensInfo({onClose}: Modals['lockedTokensInfo']) {
  const closeDistance = useCalculatedDimensionsValue(({height}) => height / 4);

  return (
    <BottomSheet
      i18nTitle={I18N.lockedTokensInfoTitle}
      onClose={onClose}
      closeDistance={closeDistance}>
      <Text
        t14
        color={Color.textBase2}
        i18n={I18N.lockedTokensInfoDescription}
      />
      <Spacer height={20} />
    </BottomSheet>
  );
}
