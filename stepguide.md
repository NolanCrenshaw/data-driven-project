### Data Driven Project Guide

##### setup directory
        $ mkdir data-driven-project
        $ git init
        $ touch .gitignore
*Added "node_modules/" to .gitignore*
        $ npm init -y
        $ npm install express@^4.0.0 pug@^2.0.0
        $ npm install nodemon@^2.0.0 --save-dev
        
##### setup route module       
        $ touch routes.js
###### initial contents:
        const express = require('express');
        const router = express.Router();

        router.get('/', (req, res) => {
            res.render('index', { title: 'Home' });
        });

        module.exports = router;

##### setup app module
        $ touch app.js
###### initial contents:
        const express = require('express');
        const routes = require('./routes');
        const app = express();

        app.set('view engine', 'pug');
        app.use(routes);

        const port = 8080;

        app.listen(port, () => console.log(`Listening on port: ${port}...`));

##### create sub directory 'views'
        $ mkdir views
        $ touch views/layout.pug
        $ touch views/index.pug
###### initial 'layout.put' contents
        doctype html
        html
          head
            title Reading List - #{title}
          body
            h1 Reading List
            div
              h2 #{title}
              block content
###### initial 'index.pug' contents
        extends layout.pug

        block content
          p Hello from the Reading List App!

##### edit 'package.json' to replace placeholder npm test script
        "scripts": {
            "start": "nodemon app.js"
        },