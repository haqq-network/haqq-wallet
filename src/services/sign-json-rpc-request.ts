import {TransactionRequest} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {
  awaitForBluetooth,
  getProviderInstanceForWallet,
  hideModal,
  showModal,
} from '@app/helpers';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {getDefaultNetwork} from '@app/network';
import {Cosmos} from '@app/services/cosmos';
import {PartialJsonRpcRequest, WalletType} from '@app/types';
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  isEthTypedData,
} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export class SignJsonRpcRequest {
  /**
   * @example of request.params
   *
   * eth_sendTransaction
   * {
   *   "from": "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b",
   *   "to": "0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb",
   *   "value": "0x0",
   *   "gasLimit": "0x5028",
   *   "gasPrice": "0x2540be400",
   *   "type": "0x0"
   * }
   *
   * eth_sign
   *  [
   *   "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b",
   *   "0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0"
   *  ]
   *
   * personal_sign
   * [
   *  "0x4578616d706c652060706572736f6e616c5f7369676e60206d657373616765",
   *  "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b",
   *  "Example password"
   * ]
   *
   * eth_signTypedData
   * [
   *   [
   *     {
   *       "type": "string",
   *       "name": "Message",
   *       "value": "Hi, Alice!"
   *     },
   *     {
   *       "type": "uint32",
   *       "name": "A number",
   *       "value": "1337"
   *     }
   *   ],
   *   "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b"
   * ]
   *
   * eth_signTypedData_v3
   * [
   *  "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b",
   *  "{\"types\":{\"EIP712Domain\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"version\",\"type\":\"string\"},{\"name\":\"chainId\",\"type\":\"uint256\"},{\"name\":\"verifyingContract\",\"type\":\"address\"}],\"Person\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"wallet\",\"type\":\"address\"}],\"Mail\":[{\"name\":\"from\",\"type\":\"Person\"},{\"name\":\"to\",\"type\":\"Person\"},{\"name\":\"contents\",\"type\":\"string\"}]},\"primaryType\":\"Mail\",\"domain\":{\"name\":\"Ether Mail\",\"version\":\"1\",\"chainId\":344593,\"verifyingContract\":\"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\"},\"message\":{\"from\":{\"name\":\"Cow\",\"wallet\":\"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826\"},\"to\":{\"name\":\"Bob\",\"wallet\":\"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB\"},\"contents\":\"Hello, Bob!\"}}"
   * ]
   *
   * eth_signTypedData_v4
   * [
   *  "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b",
   *  "{\"domain\":{\"chainId\":\"344593\",\"name\":\"Ether Mail\",\"verifyingContract\":\"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\",\"version\":\"1\"},\"message\":{\"contents\":\"Hello, Bob!\",\"from\":{\"name\":\"Cow\",\"wallets\":[\"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826\",\"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF\"]},\"to\":[{\"name\":\"Bob\",\"wallets\":[\"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB\",\"0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57\",\"0xB0B0b0b0b0b0B000000000000000000000000000\"]}]},\"primaryType\":\"Mail\",\"types\":{\"EIP712Domain\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"version\",\"type\":\"string\"},{\"name\":\"chainId\",\"type\":\"uint256\"},{\"name\":\"verifyingContract\",\"type\":\"address\"}],\"Group\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"members\",\"type\":\"Person[]\"}],\"Mail\":[{\"name\":\"from\",\"type\":\"Person\"},{\"name\":\"to\",\"type\":\"Person[]\"},{\"name\":\"contents\",\"type\":\"string\"}],\"Person\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"wallets\",\"type\":\"address[]\"}]}}"
   * ]
   */
  public static async signEIP155Request(
    wallet: Wallet | string,
    request: PartialJsonRpcRequest,
    chainId?: number,
  ) {
    if (typeof wallet === 'string') {
      wallet = Wallet.getById(wallet)!;
    }

    if (!wallet) {
      throw new Error(
        '[SignJsonRpcRequest:SignJsonRpcRequest]: wallet is undefined',
      );
    }

    const instanceProvider = await getProviderInstanceForWallet(wallet);

    if (!instanceProvider) {
      throw new Error(
        '[SignJsonRpcRequest:SignJsonRpcRequest]: provider is undefined',
      );
    }

    const provider = chainId && Provider.getByChainId(chainId);

    const rpcProvider = provider
      ? await getRpcProvider(provider)
      : getDefaultNetwork();

    if (wallet.type === WalletType.ledgerBt) {
      await awaitForBluetooth();
      showModal('ledgerAttention');
    }

    const path = wallet.path || '/';
    let result: string | undefined;

    try {
      if (request.params?.[0]?.gas) {
        request.params[0].gasPrice = request.params[0].gas;
        delete request.params[0].gas;
      }
    } catch (e) {}

    switch (request.method) {
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN:
        const message = getSignParamsMessage(request.params);
        result = await instanceProvider.signPersonalMessage(path, message);
        break;
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
        const typedData = getSignTypedDataParamsData(request.params);
        if (isEthTypedData(typedData)) {
          const cosmos = new Cosmos(app.provider!);
          const signedMessageHash = await cosmos.signTypedData(
            path,
            instanceProvider,
            typedData.domain,
            // @ts-ignore
            typedData.types,
            typedData.message,
          );

          if (wallet.type === WalletType.ledgerBt) {
            result = signedMessageHash;
          } else {
            result = `0x${signedMessageHash}`;
          }
        } else {
          throw new Error('unsupported typed data params');
        }
        break;
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        let sendTransactionRequest: TransactionRequest = request.params[0];

        const {address} = await instanceProvider.getAccountInfo(path);
        const nonce = await rpcProvider.getTransactionCount(address, 'latest');
        const {_hex: estimateGas} = await rpcProvider.estimateGas({
          ...sendTransactionRequest,
          from: address,
        });
        sendTransactionRequest = {
          ...sendTransactionRequest,
          maxFeePerGas: sendTransactionRequest.gasPrice,
          gasLimit: estimateGas,
          nonce,
          type: 2,
        };

        if (chainId) {
          sendTransactionRequest.chainId = chainId;
        }

        const signedTransaction = await instanceProvider.signTransaction(
          path,
          sendTransactionRequest,
        );

        const tx = await rpcProvider.sendTransaction(signedTransaction);
        result = tx.hash;
        break;
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        let signTransactionRequest: TransactionRequest = request.params[0];

        delete signTransactionRequest.from;
        delete signTransactionRequest.type;

        if (chainId) {
          signTransactionRequest.chainId = chainId;
        }

        result = await instanceProvider.signTransaction(
          path,
          signTransactionRequest,
        );
        break;
      default:
        throw new Error(
          '[SignJsonRpcRequest:signEIP155Request]: INVALID_METHOD',
        );
    }

    if (wallet.type === WalletType.ledgerBt) {
      hideModal('ledgerAttention');
    }

    if (!result) {
      throw new Error(
        '[SignJsonRpcRequest:signEIP155Request]: result is undefined',
      );
    }

    if (DEBUG_VARS.enableWalletConnectLogger) {
      console.log('✅ signEIP155Request result:', result, result.length);
    }

    return result;
  }
}
