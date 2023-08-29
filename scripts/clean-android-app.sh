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
        echo -e "${RED}Error:\n$OUTPUT"
    fi
}

# Execute commands
execute_command "adb shell am force-stop $APP_PACKAGE_NAME"

# Clear the app data
execute_command "adb shell pm clear $APP_PACKAGE_NAME"

# Get the path to the APK file on the device
APK_PATH=$(adb shell pm path $APP_PACKAGE_NAME | sed -e "s/package://")

# Pull the APK to a local temporary directory
execute_command "adb pull $APK_PATH /tmp/app.apk"

# Uninstall the app
execute_command "adb uninstall $APP_PACKAGE_NAME"

# Install the app
execute_command "adb install /tmp/app.apk"

# Delete the APK from the local temporary directory
execute_command "rm /tmp/app.apk"

# Launch the app
yarn devmode:android