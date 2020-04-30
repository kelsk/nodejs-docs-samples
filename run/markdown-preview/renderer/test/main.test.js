// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const path = require('path');
const supertest = require('supertest');

let request;

describe('Unit Tests', () => {
  before(() => {
    const app = require(path.join(__dirname, '..', 'main'));
    request = supertest(app);
  });

  it('should return Bad Request with an invalid payload', async () => {
    await request.post('/').type('json').send('markdown: true').expect(400);
  });

  it('should succeed with a valid request', async () => {
    const header = {markdown: { data: "**markdown text**"}};
    await request.post('/').type('json').send(header).expect(200).then(res => {
      const body = res.body;
      assert.equal(body.data, "<p><strong>markdown text</strong></p>\n")
    });
  });

  it('should succeed with a request that includes xss', async () => {
    let text = "<script>script</script>";
    let header = {markdown: { data: text}};
    await request.post('/').type('json').send(header).expect(200).then(res => {
      const body = res.body;
      assert.deepStrictEqual(body.data, "<p>&lt;script&gt;script&lt;/script&gt;</p>\n");
     });
    text = '<a onblur="alert(secret)" href="http://www.google.com">Google</a>'
    header = {markdown: { data: text}};
    await request.post('/').type('json').send(header).expect(200).then(res => {
      const body = res.body;
      assert.deepStrictEqual(body.data, "<p>&lt;a onblur=&quot;alert(secret)&quot; href=&quot;http://www.google.com&quot;&gt;Google&lt;/a&gt;</p>\n");
     });
  })
})

