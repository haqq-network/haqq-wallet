### Inpage Bridge Web3 documentation
---
**Table of Contents**
- [Inpage Bridge Web3 documentation](#inpage-bridge-web3-documentation)
- [Injected properties](#injected-properties)
- [Supported methods for `window.ethereum.request()`](#supported-methods-for-windowethereumrequest)
- [Custom Headers](#custom-headers)
- [How to update `InpageBridgeWeb3.js`](#how-to-update-inpagebridgeweb3js)

 Haqq Wallet injects the provider API into websites visited by its users using the `window.ethereum` provider object. You can use the provider properties, methods, and events in your dapp.

 > [window.ethereum provider API (MetaMask docs)](https://docs.metamask.io/wallet/reference/provider-api)

### Injected properties

```ts
window.ethereum.isHaqqWallet: boolean;
```

This property is `true` if the user use Haqq Wallet.

```ts
window.platformOS: 'ios' | 'android';
```

This property is string value representing the current OS.

### Supported methods for `window.ethereum.request()`
Below are some of the methods supported in Haqq Wallet:

| Method Name                  | Params `array`                                          | Return Type                                                                                                      | Description                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eth_accounts`               | None                                                    | Array<string>                                                                                                    | Returns an array of accounts                                                                                                                                                                         |
| `eth_blockNumber`            | None                                                    | String                                                                                                           | Returns the number of the most recent block                                                                                                                                                          |
| `eth_call`                   | `[tx: TransactionRequest, blockTag?: string \| number]` | String                                                                                                           | Executes a new message call immediately without creating a transaction on the blockchain. [TransactionRequest](https://github.com/haqq-network/haqq-wallet-provider-base/blob/main/src/types.ts#L71) |
| `eth_chainId`                | None                                                    | String                                                                                                           | Returns the current chain ID as a hex string                                                                                                                                                         |
| `eth_estimateGas`            | `[tx: TransactionRequest]`                              | String                                                                                                           | Estimates the gas needed to execute a call. [TransactionRequest](https://github.com/haqq-network/haqq-wallet-provider-base/blob/main/src/types.ts#L71)                                               |
| `eth_getBlock`               | `[blockTag: string \| number]`                          | Object                                                                                                           | Returns block data for a specific block number                                                                                                                                                       |
| `eth_getBlockByNumber`       | `[blockTag: string \| number]`                          | Object                                                                                                           | Returns block data for a specific block number                                                                                                                                                       |
| `eth_getCode`                | `[addressOrName: string, blockTag?: string \| number]`  | String                                                                                                           | Returns the code at a given address                                                                                                                                                                  |
| `eth_getTransactionByHash`   | `[transactionHash: string]`                             | Object                                                                                                           | Returns the transaction for the given hash                                                                                                                                                           |
| `eth_getTransactionCount`    | `[addressOrName: string, blockTag?: string \| number]`  | String                                                                                                           | Returns the number of transactions sent from an address                                                                                                                                              |
| `eth_getTransactionReceipt`  | `[transactionHash: string]`                             | Object \| null                                                                                                   | Returns the receipt of the transaction, or null if the transaction is not mined yet                                                                                                                  |
| `eth_hashrate`               | None                                                    | String                                                                                                           | Returns the current hash rate as a hex string                                                                                                                                                        |
| `eth_mining`                 | None                                                    | Boolean                                                                                                          | Returns a boolean indicating if the client is actively mining                                                                                                                                        |
| `eth_requestAccounts`        | None                                                    | Array<string>                                                                                                    | Prompts the user for account access, returns an array of accounts                                                                                                                                    |
| `eth_sendTransaction`        | `[tx: TransactionRequest]`                              | String                                                                                                           | Sends a transaction, returns the transaction hash [TransactionRequest](https://github.com/haqq-network/haqq-wallet-provider-base/blob/main/src/types.ts#L71)                                         |
| `eth_sign`                   | `[walletAddress: string, message: string]`              | String                                                                                                           | Signs data with a specified account, returns the signature                                                                                                                                           |
| `eth_signTransaction`        | `[tx: TransactionRequest]`                              | Object                                                                                                           | Signs a transaction, returns the signed transaction. [TransactionRequest](https://github.com/haqq-network/haqq-wallet-provider-base/blob/main/src/types.ts#L71)                                      |
| `eth_signTypedData`          | `[typedData: Object]`                                   | String                                                                                                           | Signs typed data, returns the signature                                                                                                                                                              |
| `eth_signTypedData_v3`       | `[typedData: Object]`                                   | String                                                                                                           | Signs typed data, returns the signature                                                                                                                                                              |
| `eth_signTypedData_v4`       | `[typedData: Object]`                                   | String                                                                                                           | Signs typed data, returns the signature                                                                                                                                                              |
| `metamask_getProviderState`  | None                                                    | `{chainId: string, networkVersion: string, accounts: Array<string>, isUnlocked: boolean, isHaqqWallet: boolean}` | Provides the state of the Haqq Wallet JSON RPC provider                                                                                                                                              |
| `net_listening`              | None                                                    | Boolean                                                                                                          | Returns a boolean indicating if the client is listening for network connections                                                                                                                      |
| `net_version`                | None                                                    | String                                                                                                           | Returns the current network ID as a string                                                                                                                                                           |
| `personal_sign`              | `[walletAddress: string, message: string]`              | String                                                                                                           | Signs data with a specified account, returns the signature                                                                                                                                           |
| `wallet_scanQRCode`          | `[regExp?: string]`                                     | String                                                                                                           | Prompts the user to scan a QR code, returns the scanned data                                                                                                                                         |
| `web3_clientVersion`         | None                                                    | `HAQQ/${appVersion}/Wallet`                                                                                      | Returns the client version                                                                                                                                                                           |
| `wallet_switchEthereumChain` | None                                                    | null                                                                                                             | Switches the current chain, returns null (show popup with saved chains)                                                                                                                              |
| `wallet_addEthereumChain`    | `[chainParams: EthereumChainParams]`                    | null                                                                                                             | Requests the user to add a new chain, returns null. [EthereumChainParams](https://github.com/haqq-network/haqq-wallet/blob/main/src/helpers/web3-browser-utils.ts#L29)                               |



 > For more information, visit the [MetaMask Documentation](https://docs.metamask.io/wallet/reference/rpc-api/#provider)

### Custom Headers

The Haqq-Wallet WebView sends the following [custom HTTP headers](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#working-with-custom-headers-sessions-and-cookies) with each request:

1. `X-App-Name`

- **Description**: The name identifier for the application.
- **Value**: `haqq-wallet`

2. `X-App-Version`

- **Description**: The current version of the Haqq-Wallet application.
- **Value**: A string representing the app version, retrieved dynamically from the app's services.

3. `X-App-Platform`

- **Description**: The operating system platform on which the application is running.
- **Value**: Platform identifier (e.g., `android`, `ios`), provided by React Native's `Platform.OS`.

4. `X-App-Browser`

- **Description**: The type of browser session from which the request originated.
- **Value**: Either `inapp` or `web3`, indicating an in-application browser or a web3 browser respectively.

### How to update `InpageBridgeWeb3.js`
**Instructions to Obtain InpageBridgeWeb3.js from MetaMask's mobile-provider**

1. **Clone the Repository**

   - Open your terminal or command prompt.
   - Enter the following command to clone the MetaMask mobile-provider repository:
     ```bash
     git clone https://github.com/MetaMask/mobile-provider.git
     ```

2. **Navigate to the Directory**

   - Change into the directory of the cloned repository:
     ```bash
     cd mobile-provider
     ```

3. **Build the Package**

   - Depending on the build process used by the repository (usually mentioned in the README or package.json file), you might need to run a build command. Commonly for JavaScript projects, this might be:
     ```bash
     yarn && yarn build
     ```

4. **Сopy the Script to React Native Project**

 - You should copy `InpageBridgeWeb3.js` to the [/assets/custom/InpageBridgeWeb3.js](https://github.com/haqq-network/haqq-wallet/blob/main/assets/custom/InpageBridgeWeb3.js) directory of your React Native project.
 - Run `yarn link-assets`
 - Build the `Haqq Wallet` app from sources again

