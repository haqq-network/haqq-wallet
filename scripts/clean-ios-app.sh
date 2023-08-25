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
        echo -e "${RED}ERROR:\n$OUTPUT"
    fi
}

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

# Delete the temporary folder
execute_command "rm -rf /tmp/$(basename $APP_PATH)"

yarn devmode:ios
