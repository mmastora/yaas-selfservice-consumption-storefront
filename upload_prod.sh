#!/bin/bash

# The following environment variables are expected to be injected by Jenkins:
#
# teamCECenterCFUser -> user name for logging into cloud foundry
# teamCECenterCFProdPassword -> password for logging into cloud foundry (AWS Prod)

# Name of the cloud foundry deployment manifest
#cfManifest="static-manifest.yml"
cfManifest="$1"
# Print a message to stderr and exit the script with an error
exitWithError() {
    echo "$*; giving up" >&2
    exit 1
}

# Log on to cloud foundry if the script is being executed on Jenkins; if the script runs on the developer machine, we 
# assume the developer is logged on to cloud foundry with their user already
if [ ! -z "$teamSelfServiceCFUser" ] && [ ! -z "$teamSelfServiceCFProdPassword" ]; then
    cf login -u "$teamSelfServiceCFUser" -p "$teamSelfServiceCFProdPassword" -o 'cec-prod' -s 'selfservice' -a "$appEndPoint" || exitWithError "Could not log on to cloud foundry"
fi

# Push and start the app
cf push -f "$cfManifest" || exitWithError "Could not push and start the application $appName to cloud foundry"