#!/bin/bash

# Define text colors
RED='\033[0;31m'
GREEN='\033[0;32m'

# Define the app package name constant
APP_PACKAGE_NAME="com.haqq.wallet"

# Function to execute a command and print an error message if needed
execute_command() {
    COMMAND=$1
    echo "✅ ${GREEN}$COMMAND"
    OUTPUT=$($COMMAND 2>&1)
    RESULT=$?

    if [ $RESULT -ne 0 ]; then
        echo "${RED}ERROR:\n$OUTPUT"
    fi
}

isInstalled() {
  PROGRAM=$1
  BREW_PACKAGE=$([ -n "${2}" ] && echo "${2}" || echo "${1}")

  if ! command -v "$PROGRAM" &> /dev/null
  then
      echo "${PROGRAM} could not be found"
      echo "installing via brew"
      brew install ${BREW_PACKAGE}
  fi
}

isInstalled ios-deploy
isInstalled idevice_id libimobiledevice

DEVICE_UDID=$(idevice_id -l)

# If physical device connected
if [ -n "${DEVICE_UDID}" ]; then
  SIMULATOR_UDID=$(xcrun simctl list devices | grep "(Booted)" | grep -E -o -i "([0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12})")
  CURRENT_UDID=$([ -n "${DEVICE_UDID}" ] && echo "${DEVICE_UDID}" || echo "${SIMULATOR_UDID}")
  SUFFIX=$([ -n "${DEVICE_UDID}" ] && echo "iphoneos" || echo "iphonesimulator")
  APP_PATH=$(mdfind "kMDItemCFBundleIdentifier == '$APP_PACKAGE_NAME'" | grep "${SUFFIX}")
  execute_command "ios-deploy --uninstall_only --bundle_id "$APP_PACKAGE_NAME" --id "${CURRENT_UDID}""
  execute_command "ios-deploy --bundle "$APP_PATH" --bundle_id "$APP_PACKAGE_NAME" --id "${CURRENT_UDID}""
else
  # Working with simulator 
  # Execute commands
  execute_command "xcrun simctl terminate Booted $APP_PACKAGE_NAME"
  execute_command "xcrun simctl privacy Booted revoke all $APP_PACKAGE_NAME"
  execute_command "xcrun simctl privacy Booted reset all $APP_PACKAGE_NAME"
  execute_command "xcrun simctl keychain Booted reset"

  # Get the path to the app folder
  APP_PATH=$(xcrun simctl get_app_container Booted $APP_PACKAGE_NAME app)
  execute_command "cp -r $APP_PATH /tmp/"

  execute_command "xcrun simctl uninstall Booted $APP_PACKAGE_NAME"
  execute_command "xcrun simctl install Booted /tmp/$(basename $APP_PATH)"
  execute_command "xcrun simctl launch booted com.haqq.wallet"

  # Delete the temporary folder
  execute_command "rm -rf /tmp/$(basename $APP_PATH)"
fi

yarn devmode:ios