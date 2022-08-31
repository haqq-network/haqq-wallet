export const ContactSchema = {
  name: 'Contact',
  properties: {
    account: 'string',
    name: 'string',
  },
  primaryKey: 'account',
};

export type ContactType = {
  account: string;
  name: string;
};

export function shortAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(
    address.length - 8,
    address.length,
  )}`;
}
