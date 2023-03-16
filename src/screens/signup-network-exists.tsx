import React, {useCallback} from 'react';

import {SignupNetworkExists} from '@app/components/signup-network-exists';

export const SignupNetworkExistsScreen = () => {
  const onRestore = useCallback(() => {}, []);
  const onRewrite = useCallback(() => {}, []);

  return <SignupNetworkExists onRestore={onRestore} onRewrite={onRewrite} />;
};
