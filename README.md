# Installing and running the project

## First of all we need to clone the repository

To do this, we need to write the following in the terminal:

```
git clone https://github.com/haqq-network/haqq-wallet.git
```

## Installing the required libraries

To install the necessary libraries, you need to register the following in the same terminal:

```
cd haqq-wallet && yarn
```

All the necessary libraries will be downloaded for you, if you use mac os, after the download is completed, you must write the following:

```
cd ios && pod install
```

## Creation.env file

For the project to work correctly, we need to create a .env file and write the following there:

```sh
PROVIDER_NETWORK=https://rpc.eth.testedge2.haqq.network
PROVIDER_WS_NETWORK=wss://rpc-ws.eth.testedge2.haqq.network
PROVIDER_CHAIN_ID=54211
SENTRY_DSN=https://7a89fad62ad7450fbf03fa4426d14a92@o1347520.ingest.sentry.io/6626256
NETWORK_EXPLORER=https://explorer.testedge2.haqq.network/
PATTERNS_SOURCE=https://raw.githubusercontent.com/haqq-network/haqq-wallet-patterns/main/
IS_DEVELOPMENT=1
```

## Application launch

To run the application, write the following in the terminal:

```sh
// to start android dev application
yarn android

// to start iOS dev application
yarn ios
```
