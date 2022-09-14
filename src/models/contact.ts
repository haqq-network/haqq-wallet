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
