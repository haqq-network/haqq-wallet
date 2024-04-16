import React from 'react';

import {observer} from 'mobx-react';

import {SwapPreview} from '@app/components/swap';

export const SwapPreviewScreen = observer(() => {
  return <SwapPreview />;
});
