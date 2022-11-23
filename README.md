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

## Creation .env file

You must .env.example should be copied with

```sh
cp .env.example .env
```

and then must be substitute own config values.

## Application launch

To run the application, write the following in the terminal:

```sh
// to start android dev application
yarn android

// to start iOS dev application
yarn ios
```
