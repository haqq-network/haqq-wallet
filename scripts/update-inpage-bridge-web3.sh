#!/bin/bash

mkdir providers
cd providers

git clone https://github.com/MetaMask/mobile-provider.git
git clone https://github.com/haqq-network/haqq-keplr-mobile-provider.git

# Build metamask ethereum provider
cd mobile-provider
mkdir -p dist
echo 'empty' > dist/empty  
yarn && yarn build
cp ./dist/index.js ../../android/app/src/main/assets/custom/metamask-mobile-provider.js
cp ./dist/index.js ../../assets/custom/metamask-mobile-provider.js

# Build keplr cosmos provider
cd ../haqq-keplr-mobile-provider
yarn && yarn build
cp ./dist/keplr-mobile-provider.js ../../android/app/src/main/assets/custom/keplr-mobile-provider.js
cp ./dist/keplr-mobile-provider.js ../../assets/custom/keplr-mobile-provider.js

# Clean up
cd ../..
rm -rf providers

echo "✅ Inpage bridge web3 providers updated! Rebuild native app to see changes."