// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable no-warning-comments */

'use strict';

const main = (
  projectId = process.env.GCLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  hl7v2StoreId,
  hl7v2MessageId
) => {
  // [START healthcare_delete_hl7v2_message]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1');

  const deleteHl7v2Message = async () => {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const hl7v2StoreId = 'my-hl7v2-store';
    // const hl7v2MessageId = 'qCnewKno44gTt3oBn4dQ0u8ZA23ibDdV9GpifD2E=';
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}/messages/${hl7v2MessageId}`;
    const request = {name};

    await healthcare.projects.locations.datasets.hl7V2Stores.messages.delete(
      request
    );
    console.log('Deleted HL7v2 message');
  };

  deleteHl7v2Message();
  // [END healthcare_delete_hl7v2_message]
};

// node deleteHl7v2Message.js <projectId> <cloudRegion> <datasetId> <hl7v2StoreId> <hl7v2MessageId>
main(...process.argv.slice(2));
