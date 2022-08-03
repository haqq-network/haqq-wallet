import {createContext, useContext} from "react";

export type GrpcResponse<T> = {
  jsonrpc: string;
  id: number;
} & T;

export class Grpc {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getBalance(address: string) {
    return this.query<{result: string}>({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
  }

  async query<T>(data: object): Promise<GrpcResponse<T>> {
    const req = await fetch(`${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        ...data,
      }),
    });

    const resp = await req.json();
    return resp;
  }
}

export const grpc = new Grpc('http://159.69.6.222:8545');

export const GrpcContext = createContext(grpc);

export function useGrpc() {
  const context = useContext(GrpcContext);

  return context;
}
