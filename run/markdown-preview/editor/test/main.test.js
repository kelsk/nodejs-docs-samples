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
const sinon = require('sinon');
const supertest = require('supertest');

describe('Editor unit tests', () => {
  describe('Initialize app', () => {
    it('should successfully start the app', async function () {
      const {app} = require(path.join(__dirname, '..', 'main'));
      const request = supertest(app);
      await request.get('/').expect(200);
    })
  });

  describe('Handlebars compiler', async () => {
    let template;

    before( async () => {
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {buildRenderedHtml} = require(path.join(__dirname, '..', 'main'));
      template = await buildRenderedHtml();
    })

    it('includes HTML from the templates', () => {
      let htmlString = template.includes('<title>Markdown Editor</title>');
      assert.equal(htmlString, true);
    });

    it('includes Markdown from the templates', () => {
      let markdownString = template.includes("This UI allows a user to write Markdown text");
      assert.equal(markdownString, true)
    });

    it('accurately checks the template for nonexistant string', () => {
      let falseString = template.includes("not a string in the template");
      assert.equal(falseString, false);      
    });
  });

  describe('Render request', () => {
    let request;

    before(async () => {
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {app} = require(path.join(__dirname, '..', 'main'));
      request = supertest(app);
    });

    it('should respond with Not Found for a GET request to the /render endpoint', async () => {
      await request.get('/render').expect(404);
    });

    it('can make a POST request, with an error thrown by the Google Auth server', async function () {
      this.timeout(9000);
      const consoleStub = sinon.stub(console, 'log');
      // Ensure that the expected error is logged.
      await request.post('/render').type('json').send({body: {"data":"markdown"}});
      const message = console.log.getCall(0).args[1].message;
      assert.equal(message, "GoogleAuth server could not respond to request: ");
      consoleStub.restore();
    });
  });
});
