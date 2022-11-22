import {useEffect, useState} from 'react';

import {app} from '@app/contexts';

export function useUser() {
  const user = app.getUser();
  const [, setDate] = useState(new Date());
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
