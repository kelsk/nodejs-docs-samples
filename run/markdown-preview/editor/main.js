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

// Sample editor provides a frontend to a markdown rendering microservice.


  const express = require('express');
  const {renderService} = require('./service.js');
  const {renderRequest} = require('./render.js');

  const app = express()

  app.use(express.json());
  app.use(express.urlencoded());
  
  const service = renderService();

  app.get('/', async (req, res) => { 
    try {
      const parsedTemplate = service.parsedTemplate;
      res.send(parsedTemplate)
    } catch (err) {
      console.log(err)
      res.send('error', err)
    }
  })

  app.post('/render', async (req, res) => {
    console.log('body in post: ', req.body);
    const markdown = req.body.data; // markdown text from index.html
    const render = await renderRequest(service, markdown)
    res.send(render) 
  })

  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`app listening on port ${port}`))
  
