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

## Application launch

To run the application, write the following in the terminal:

If you are using Android

```
yarn android
```

If you are using iOS

```
yarn ios
```
