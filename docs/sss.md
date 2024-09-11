### SSS Flow Documentation
---
**Table of Contents**
- [Overview](#overview)
- [Create Flow](#create-flow)
- [Cloud Share Verification](#cloud-share-verification)
- [Remove Flow](#remove-flow)

**Provider:**
- [@haqq/provider-sss-react-native](https://github.com/haqq-network/haqq-wallet-provider-sss-react-native)
- [Provider Docs](https://github.com/haqq-network/haqq-wallet-provider-sss-react-native/blob/main/docs/modules.md)

### Overview

**SSS** - Shamir's Secret Sharing (SSS) is a cryptographic algorithm used to split a secret into multiple parts, where a minimum number of parts are required to reconstruct the original secret. This method enhances security by ensuring that no single entity holds the entire secret.

### Create Flow

#### Sign Up

1. [User selected network from the list](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/screens/WelcomeStack/SignUpStack/signup-networks.tsx#L22). We have several providers support, for now this is: *Google Drive, Apple iCloud, Custom Provider (only for Dev Mode)*. We get the token from provider at this step and after this we are going to [onAuthorized](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/services/provider-sss.ts#L114) which sends a `jsonrpcRequest` to `sss_generate_shares_url` and then get back with `creds` object. `Creds` has `token`,`verifier` and a `privateKey`.
2. Then we need to [verify cloud](https://github.com/haqq-network/haqq-wallet/blob/3ce967c879901a11e2b81ab738f8e2eec03fda8e/src/helpers/verify-cloud.ts#L11), because we need to make sure, that we have an access to write generated `cloud` share into `storage`.
3. Let's verify that [we doesn't have any existing wallets](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/screens/WelcomeStack/SignUpStack/signup-networks.tsx#L62) by using `getMetadataValue(sss_metadata_url)` function.
4. After this we pass all required data throw `signup-*` stack and then in `signup-store-wallet` [we are creating a new wallet](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/screens/WelcomeStack/SignUpStack/signup-store-wallet.tsx#L45). `ProviderSSSReactNative.initialize` will create **3** shares. 1st will be stored in provider's `storage`, 2nd in `EncryptedStorage`. 3rd share which is located in `blockchain`.
5. Mark `wallet.socialLinkEnabled` [true](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/screens/WelcomeStack/SignUpStack/signup-store-wallet.tsx#L132). It means, that `wallet` is sss-protected.

During this flow we can have `sssLimitReacted` error, it's ok. In managed with backend configuration. Please contact [Andrey](https://github.com/vivalaakam) about it if you have any problems.

#### Sign In

1. Same as **Sign Up**. We need to [select provider first](https://github.com/haqq-network/haqq-wallet/blob/ed1fcdc1ad27f966520c6e4b66dc7148f2461018/src/screens/WelcomeStack/SignInStack/signin-networks.tsx#L32). Check [do we have any `walletInfo` in `Blockchain`](https://github.com/haqq-network/haqq-wallet/blob/ed1fcdc1ad27f966520c6e4b66dc7148f2461018/src/screens/WelcomeStack/SignInStack/signin-networks.tsx#L57).
2. After this we will get from this path:
```javascript
const cloudShare = await cloud.getItem(
  `haqq_${account.address.toLowerCase()}`,
);

const localShare = await EncryptedStorage.getItem(
  `${ITEM_KEY}_${account.address.toLowerCase()}`,
);
```
and [pass it to `ProviderSSSReactNative.initialize`](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/screens/WelcomeStack/SignInStack/signin-store-wallet.tsx#L94). Otherwise there is [some logic](https://github.com/haqq-network/haqq-wallet/blob/ed1fcdc1ad27f966520c6e4b66dc7148f2461018/src/screens/WelcomeStack/SignInStack/signin-networks.tsx#L95) related to shares existence.

3. Wallets were created at `ChooseAccount` screen.

#### Cloud Share Verification

On every enter to the `Home` page we are [checking cloud share existance](https://github.com/haqq-network/haqq-wallet/blob/7abbcd863265a94d2bc0bf1598933fcf1b0346be/src/screens/HomeStack/home.tsx#L132). If there is no cloud share, we will try to [create a new one](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/components/modals/cloud-share-not-found.tsx#L35) in `CloudShareNotFound` modal.

#### Remove Flow

When we are removing the last SSS wallet, we need to [show `RemoveSSS` modal](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/screens/HomeStack/ManageAccountsStack/settings-account-detail.tsx#L96) and suggest user to [completely remove all local and cloud share](https://github.com/haqq-network/haqq-wallet/blob/f12c76361a7d759f2a9f841c0627ec3b6eef7081/src/components/modals/remove-sss.tsx#L101).