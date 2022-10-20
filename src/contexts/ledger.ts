import {createContext} from 'react';
import {wallets} from './wallets';
import {Ledger} from '../services/ledger';

export const LedgerContext = createContext<Ledger>({} as Ledger);
