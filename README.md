<div align="center">
  <img src="https://i.postimg.cc/7LfNCmP3/app-logo.png" width="120" height="120">
	<h1>HAQQ Wallet</h1> 
	<p>
		<b>HAQQ Wallet is non-custodial wallet for the <a href="https://haqq.network">HAQQ Network</a> ecosystem</b>
	</p>
	<br>
	<br>
	<br>
</div>

- Staking
- Governance
- Ledger integration
- Flexible customization
- QR scanner
- Mnemonic-free private key security (is coming soon)

## Download

<a href="https://apps.apple.com/app/haqq-wallet-by-bored-gen/id6443843352" rel="nofollow"><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1672185600" alt="" width="160"></a>

<a href="https://play.google.com/store/apps/details?id=com.haqq.wallet" rel="nofollow"><img src="https://www.wordnote.app/assets/google-play-badge.png" alt="" width="160"></a>

## Installing and running the project

### First of all we need to clone the repository

To do this, we need to write the following in the terminal:

```
git clone https://github.com/haqq-network/haqq-wallet.git
```

### Installing the required libraries

To install the necessary libraries, you need to register the following in the same terminal:

```
cd haqq-wallet && yarn
```

All the necessary libraries will be downloaded for you, if you use mac os, after the download is completed, you must write the following:

```
cd ios && pod install
```

### Creation .env file

You must .env.example should be copied with

```sh
cp .env.example .env
```

and then must be substitute own config values.

### Application launch

To run the application, write the following in the terminal:

```sh
// to start android dev application
yarn android

// to start iOS dev application
yarn ios
```

### Assets, typography and design links

- [Design system](https://www.figma.com/file/KoyH6PqWqfOwyIVDjnLlOk/%F0%9F%93%B1-Wallet?t=M7ZT91FhlYgJRSiI-6)
- [Typography](https://www.figma.com/file/95cNViNal0YIu3HYTNH0TO/Typography?node-id=0%3A1)
- [Icons](https://www.figma.com/file/3NNIlmuGoRMq6GaGphfrOw/Icon?node-id=0%3A1)
- [Colors and styles](https://www.figma.com/file/hVISlIFIJFPsnhlVmpNxrR/Style?node-id=0%3A1)
- [Native elements](https://www.figma.com/file/S0H6bDoI2ySSSK2lsrif32/iOS-Native-Elements?node-id=0%3A1)
- [Common elements](https://www.figma.com/file/lgQR66d0ixkg57MdSjmrOf/iOS-Library?node-id=122%3A2987)
- [Lottie json animations](https://ysherwork.notion.site/Animation-d353911b01f448ab8c88c2cb4f0a3cf6)

## Contribution

Please check the general guidelines for contributing: [docs/contribution.md](https://github.com/haqq-network/haqq-mobile/blob/main/docs/contribution.md)
