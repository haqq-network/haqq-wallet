import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {
  useApp,
  useContacts,
  useTypedNavigation,
  useTypedRoute,
} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {generateUUID} from '@app/utils';

export const TransactionSumScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'transactionSum'>();
  const app = useApp();
  const event = useMemo(() => generateUUID(), []);
  const contacts = useContacts();
  const [to, setTo] = useState(params.to);

  const [balance, setBalance] = useState(0);
  const [fee, setFee] = useState(0);
  const contact = useMemo(() => contacts.getContact(to), [contacts, to]);

  const onAddress = useCallback((address: string) => {
    setTo(address);
  }, []);

  useEffect(() => {
    app.on(event, onAddress);

    return () => {
      app.off(event, onAddress);
    };
  }, [app, event, onAddress]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('transactionConfirmation', {
        fee,
        from: params.from,
        to,
        amount,
      });
    },
    [fee, navigation, params.from, to],
  );

  const onContact = useCallback(() => {
    navigation.navigate('transactionSumAddress', {
      to,
      event,
    });
  }, [event, navigation, to]);

  useEffect(() => {
    EthNetwork.getBalance(params.from)
      .then(b => {
        setBalance(b);
        return b;
      })
      .then(b => EthNetwork.estimateTransaction(params.from, to, b))
      .then(estimateFee => {
        setFee(estimateFee.fee);
      });
  }, [params.from, to]);

  return (
    <TransactionSum
      contact={contact}
      balance={balance}
      fee={fee}
      to={to}
      from={params.from}
      onAmount={onAmount}
      onContact={onContact}
    />
  );
};
