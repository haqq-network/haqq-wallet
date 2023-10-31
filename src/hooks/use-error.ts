import {useState} from 'react';

import {I18N, getText} from '@app/i18n';

export const useError = () => {
  const [{error, errorDetails}, _setError] = useState({
    error: '',
    errorDetails: '',
  });

  const setError = (errorId: string, details: string) =>
    _setError({
      error: getText(I18N.transactionFailed, {
        id: errorId,
      }),
      errorDetails: details,
    });

  return {error, errorDetails, setError};
};
