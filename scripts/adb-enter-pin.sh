#!/bin/bash

# Function to display help message
show_help() {
  echo
  echo "Usage: $0 <6-digit PIN code>"
  echo
  echo "This script sends a 6-digit PIN code as keyboard input to all connected ADB devices."
  echo
  echo "Options:"
  echo "  ${BOLD}-h, --help${NC}    Show this help message and exit"
}

# Colors for log messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Check for help option
if [[ $1 == "-h" || $1 == "--help" ]]; then
  show_help
  exit 0
fi

# Check if PIN code is provided
if [ $# -ne 1 ]; then
  echo "${RED}Error: Please provide a 6-digit PIN code.${NC}"
  show_help
  exit 1
fi

pin_code=$1

# Check if PIN code is 6 digits
if [[ ! "$pin_code" =~ ^[0-9]{6}$ ]]; then
  echo "${RED}Error: PIN code must be 6 digits.${NC}"
  show_help
  exit 1
fi

# Get the list of connected devices and store in an array
devices=($(adb devices | grep -w "device" | cut -f1))

# Check if there are any connected devices
if [ ${#devices[@]} -eq 0 ]; then
  echo "${RED}No connected devices found.${NC}"
  exit 1
fi

echo "${GREEN}Connected devices:${NC}"
for device in "${devices[@]}"; do
  echo " - ${BLUE}${BOLD}$device${NC}"
done
echo ""

# Send the PIN code to each connected device
for device in "${devices[@]}"; do
  echo "${GREEN}Sending PIN code to device: ${BLUE}${BOLD}$device${NC}"
  for (( i=0; i<=${#pin_code}; i++ )); do
    digit=${pin_code:$i:1}
    adb -s "$device" shell input press numeric_keyboard_"$digit"
  done
  sleep 1
done

echo ""
echo "🎉 ${GREEN}${BOLD}PIN code successfully sent to all devices.${NC}"