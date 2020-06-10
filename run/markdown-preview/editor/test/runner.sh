#!/usr/bin/env bash

# Copyright 2020 Google LLC.
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

# The markdown-preview sample needs to be tested with both the editor and renderer services deployed.
echo '---'

pushd ../renderer

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently.
export UPSTREAM_SAMPLE_VERSION="${KOKORO_GIT_COMMIT:-latest}"
export UPSTREAM_CONTAINER_IMAGE="gcr.io/${GOOGLE_CLOUD_PROJECT}/run-renderer:${UPSTREAM_SAMPLE_VERSION}"

# Build the Renderer service
set -x
gcloud builds submit --tag="${UPSTREAM_CONTAINER_IMAGE}"
set +x

pushd ../editor

requireEnv UPSTREAM_CONTAINER_IMAGE

# Assign the Renderer service container image.
SUFFIX=${KOKORO_BUILD_ID}
export UPSTREAM_SERVICE_NAME="renderer-${SUFFIX}"
requireEnv UPSTREAM_SERVICE_NAME

# Deploy the Renderer service.
FLAGS="--no-allow-unauthenticated" SERVICE_NAME=${UPSTREAM_SERVICE_NAME} CONTAINER_IMAGE=${UPSTREAM_CONTAINER_IMAGE} test/deploy.sh

# Assign the upstream Renderer service url.
export EDITOR_UPSTREAM_RENDER_URL=$(SERVICE_NAME=${UPSTREAM_SERVICE_NAME} test/url.sh)

# Deploy the Editor service.
FLAGS="--allow-unauthenticated --set-env-vars EDITOR_UPSTREAM_RENDER_URL=$EDITOR_UPSTREAM_RENDER_URL" test/deploy.sh

# Assign the Editor service url.
export BASE_URL=$(SERVICE_NAME=${SERVICE_NAME} test/url.sh)
test -z "$BASE_URL" && echo "BASE_URL value is empty" && exit 1

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
  gcloud run services delete ${UPSTREAM_SERVICE_NAME} \
    --platform=managed \
    --region="${REGION:-us-central1}" \
    --quiet
  gcloud container images delete "${UPSTREAM_CONTAINER_IMAGE}" \
    --quiet 
}
trap cleanup EXIT

# Do not use exec to preserve trap behavior.
"$@"