## Developer Mode Documentation
**Table of Contents**
- [Developer Mode Documentation](#developer-mode-documentation)
  - [Bech32/Hex Converter](#bech32hex-converter)
  - [Contract info](#contract-info)
  - [Raw Sign Request](#raw-sign-request)
  - [WalletConnect](#walletconnect)
  - [Browser](#browser)
- [Debugging WebView Contents](#debugging-webview-contents)
  - [iOS \& Safari](#ios--safari)
  - [Android \& Chrome](#android--chrome)
- [Viewing Logs](#viewing-logs)
  - [iOS](#ios)
  - [Android](#android)
- [Inpage Bridge Web3 docs](#inpage-bridge-web3-docs)


> Developer mode is not available for the `Mainnet` provider.

In Haqq Wallet, a Developer Mode is available for enhanced functionalities and testing. To activate Developer Mode, follow the steps below:


1. Navigate to `Settings > About`.
2. Tap on the application version 10 times.
   - A system alert will pop up with the warning: "Attention!!! In this mode, browser restrictions will be reset and application functionality will be slightly expanded. The mode is only active in the test network."

   <img src="https://github.com/haqq-network/haqq-wallet/blob/main/docs/images/developer-mode-attention.png" alt="WalletConnect" width="300" />

3. Tap on `Enable` to activate Developer Mode.

Once activated, Developer Mode will:

- Disable all restrictions for WalletConnect and Web3 Browser, 
- Enable transaction signing on non-whitelisted sites,
- Allow connect WalletConnect to any chain,
- Enable use of the browser search bar.

In the settings screen, a `Developer Tools` section will appear with the following functionalities:

### Bech32/Hex Converter

Enter a valid hex address or Bech32 address to convert.

### Contract info

Show info about the contract. Enter a valid hex address or Bech32 address of the contract.

```ts
interface VerifyAddressResponse {
  id: string;
  addressType: 'wallet' | 'contract' |  'unknown';
  name?: string | null;
  symbol?: string | null;
  decimals?: number | null;
  isErc20?: boolean | null;
  isErc721?: boolean | null;
  isErc1155?: boolean | null;
  isInWhiteList?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
```

### Raw Sign Request

Enter a valid JSON for JSON RPC requests in the provided field. Supported methods include:
- `personal_sign` - [MetaMask Documentation](https://docs.metamask.io/wallet/reference/personal_sign)
- `eth_sign` - [MetaMask Documentation](https://docs.metamask.io/wallet/concepts/signing-methods/#eth_sign)
- `eth_sendTransaction` - [MetaMask Documentation](https://docs.metamask.io/wallet/reference/eth_sendtransaction)
- `eth_signTransaction` - functions similarly to `eth_sendTransaction`, but does not send the transaction to the blockchain.
- `eth_signTypedData_v4` - [MetaMask Documentation](https://docs.metamask.io/wallet/reference/eth_signtypeddata_v4)

### WalletConnect

Enter the URL for connecting WalletConnect in the provided field.

<img src="https://github.com/haqq-network/haqq-wallet/blob/main/docs/images/wallet-connect-modal.png" alt="WalletConnect" width="300" />

### Browser

Utilities for browser operations will be available.

## Debugging WebView Contents

### iOS & Safari

Debug WebView contents on iOS simulator or device using Safari Developer Toolkit:

1. Enable developer mode in Haqq Wallet.
2. Open `Safari Preferences > Advanced tab > enable "Show Develop menu in menu bar"`.
3. Start Haqq Wallet and open any page with Web3 Browser in iOS simulator or device.
4. Navigate to `Safari > Develop > [device name] > [app name] > [url - title]`.
5. Debug WebView contents as on web.

**Note:** Enable `Web Inspector` in device settings: `Settings > Safari > Advanced > Web Inspector`. If device not listed in Develop menu, restart Safari.

### Android & Chrome

Debug WebView contents on Android emulator or device using Chrome DevTools:

1. Enable developer mode in Haqq Wallet.
2. Start Haqq Wallet and open any page with Web3 Browser in Android emulator or device.
3. (If you using emulator skip this step) Connect device via usb to your computer.
4. Open `chrome://inspect/#devices` on Chrome.
5. Select device on left, select "Inspect" on WebView contents to debug.

**Note:** Enable `USB debugging` in device settings: `Settings > System > About Phone > Developer options > enable USB debugging`.

## Viewing Logs

### iOS

1. Open `Console` app on Mac, select device from sidebar.
2. Set filter to `haqq` and type to `process` for app logs, or `javascript` and type `any` for React logs.
3. Press `start` on top panel to view logs.

### Android

Use following commands for log viewing:

```bash
adb logcat -v color -v time --pid $(adb shell ps | grep com.haqq.wallet  | tr -s ' ' | cut -d' ' -f2)
```

## Inpage Bridge Web3 docs

Haqq Wallet injects the provider API into websites visited by its users using the `window.ethereum` provider object. You can use the provider properties, methods, and events in your dapp. 

[Documentation link](https://github.com/haqq-network/haqq-wallet/blob/main/docs/inpage-bridge-web3.md).

