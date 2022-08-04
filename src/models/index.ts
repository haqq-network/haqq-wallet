import Realm from 'realm';
import {Wallet} from './wallet';

export const realm = new Realm({schema: [Wallet]});
