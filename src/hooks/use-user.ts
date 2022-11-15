import {useEffect, useState} from 'react';

import {app} from '@app/contexts';

export function useUser() {
  const user = app.getUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setDate] = useState(new Date());
  useEffect(() => {
    const subscription = () => {
      setDate(new Date());
    };

    user.on('change', subscription);

    return () => {
      user.removeListener('change', subscription);
    };
  }, [user]);

  return user;
}
