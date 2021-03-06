#!/usr/bin/env bash

# Copyright 2019 Google LLC.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -eo pipefail;

requireEnv() {
  test "${!1}" || (echo "Environment Variable '$1' not found" && exit 1)
}
requireEnv SERVICE_NAME

# The hello-broken sample needs to be tested with the NAME environment variable
# both set and unset.
SERVICE_OVERRIDE="${SERVICE_NAME}-override"

echo '---'
test/deploy.sh
FLAGS="--set-env-vars NAME=$NAME" SERVICE_NAME=${SERVICE_OVERRIDE} test/deploy.sh

echo
echo '---'
echo

# Register post-test cleanup.
# Only needed if deploy completed.
function cleanup {
  set -x
  gcloud run services delete ${SERVICE_NAME} \
    --platform=managed \
    --region="${REGION:-us-central1}" \
    --quiet
  gcloud run services delete ${SERVICE_OVERRIDE} \
    --platform=managed \
    --region="${REGION:-us-central1}" \
    --quiet
}
trap cleanup EXIT

# TODO: Perform authentication inside the test.
export ID_TOKEN=$(gcloud auth print-identity-token)
export BASE_URL=$(test/url.sh)
export BASE_URL_OVERRIDE=$(SERVICE_NAME=${SERVICE_OVERRIDE} test/url.sh)

test -z "$BASE_URL" && echo "BASE_URL value is empty" && exit 1
test -z "$BASE_URL_OVERRIDE" && echo "BASE_URL_OVERRIDE value is empty" && exit 1

# Do not use exec to preserve trap behavior.
"$@"
