#!/bin/bash

FULL_CLEAN=0
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -f|--full) FULL_CLEAN=1 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Full clean section
if [ "${FULL_CLEAN}" -gt 0 ]; then
  echo Remove yarn cache
  yarn cache clean

  echo Remove React Native cache
  rm -rf $TMPDIR/react-*

  echo Remove Metro bundler cache
  rm -rf $TMPDIR/metro-*

  echo Remove iOS caches
  cd ios && rm -rf build && rm -rf Pods && rm -rf ~/.cocoapods && pod cache clean --all && cd ..

  echo Remove XCode artifacts
  killall Xcode || true
  xcrun -k
  cd ios
  xcodebuild -alltargets clean 
  cd ..
  rm -rf "$(getconf DARWIN_USER_CACHE_DIR)/org.llvm.clang/ModuleCache"
  rm -rf "$(getconf DARWIN_USER_CACHE_DIR)/org.llvm.clang.$(whoami)/ModuleCache"
  rm -fr ~/Library/Developer/Xcode/DerivedData/
  rm -fr ~/Library/Caches/com.apple.dt.Xcode/

  echo Remove Android caches
  rm -rf android/build && rm -r $HOME/.gradle/caches/

  echo Clean Android build cache
  cd android && ./gradlew clean && ./gradlew --stop && cd ..
fi

# Short clean section
echo Remove Watchman cache
watchman watch-del-all

echo Reinstall node_modules
rm -rf node_modules && yarn install --silent

echo Reinstall Pods
cd ios && pod install --repo-update && cd ..

echo ✅ Done!