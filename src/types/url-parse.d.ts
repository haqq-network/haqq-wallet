/* eslint-disable import/no-default-export */
declare module 'url-parse' {
  export default class Url<Query = {}> {
    protocol: string;
    slashes: boolean;
    auth: string;
    username: string;
    password: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    query: Query;
    hash: string;
    href: string;

    constructor(address: string, parser?: boolean | Function);

    extractProtocol(url: string): any;
    trimLeft(str: string): string;

    authenticity(rest: string): void;

    extractPathname(): string;

    extractHash(): string;

    toString(): string;
  }
}
