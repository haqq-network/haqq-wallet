import Realm from 'realm';

export const Wallet = {
  name: 'Wallet',
  properties: {
    address: 'string',
    name: 'string',
    data: 'string',
  },
  primaryKey: 'address',
};

// export class Wallet extends Realm.Object {
//   static schema = {
//     name: 'Wallet',
//     properties: {
//       address: 'string',
//       name: 'string',
//       data: 'string',
//     },
//     primaryKey: 'address',
//   };
//
//   static generate(address: string, name: string, data: string) {
//     return {
//       address,
//       name,
//       data,
//     };
//   }
//
//   // address: string;
//   // name: string;
//   // data: string;
// }
