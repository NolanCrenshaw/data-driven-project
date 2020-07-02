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
```js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});
```

module.exports = router;

##### setup app module
        $ touch app.js
###### initial contents:
```js
const express = require('express');
const routes = require('./routes');
const app = express();

app.set('view engine', 'pug');
app.use(routes);

const port = 8080;

app.listen(port, () => console.log(`Listening on port: ${port}...`));
```

##### create sub directory 'views'
        $ mkdir views
        $ touch views/layout.pug
        $ touch views/index.pug
###### initial 'layout.put' contents
```pug
doctype html
html
  head
    title Reading List - #{title}
  body
    h1 Reading List
    div
      h2 #{title}
      block content
```
###### initial 'index.pug' contents
```pug
extends layout.pug

block content
  p Hello from the Reading List App!
```

##### edit 'package.json' to replace placeholder npm test script
```js
"scripts": {
    "start": "nodemon app.js"
},
```

------------------

### Improving the Application

*Separating server and application modules*

##### reconfigure app module
*Replace port declaration and 'app.listen()' with 'module.exports' statement to export the 'app' object.*

##### create sub directory 'bin'
        $ mkdir bin
        $ touch bin/www
*IMPORTANT - do not add a file extension to 'www'.*
        ###### 'www' initial contents:
```js
#!/usr/bin/env node

const app = require('../app');
const port = 8080;

app.listen(port, () => console.log(`Listening on port: ${port}...`));
```

##### update 'package.json' start script to target './bin/www'
```js
"scripts": {
    "start": "nodemon ./bin/www"
},
```
*Hard restarting nodemon may be required to activate server.*

------------

*Using the 'Morgan' HTTP request logger*

##### install 'morgan'
        $ npm install morgan
##### update 'app' module
```js
const morgan = require('morgan');
app.use(morgan('dev'));
```
------------

##### create middleware error catch function in 'app' module
```js
// custom error handler
app.use((req, res, next) => {
    const err = new Error('The requested page could not be found.');
    err.status = 404;
    next(err);
});

// handler to log errors
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // TODO log the error to database
    } else {
        console.error(err);
    }
    next(err);
});

// handler for 404 error
app.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404);
        res.render('page-not-found', {
            title: 'Page Not Found',
        });
    } else {
        next(err);
    }
});

// handler for generic error
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    const isProduction = process.env.NODE_ENV === 'production';
    res.render('error', {
        title: 'Server Error',
        message: isProduction ? null : err.message,
        stack: isProduction ? null : err.stack,
    });
});
```

##### add pug files to be referenced by error handlers
        $ touch views/error.pug
        $ touch views/page-not-found.pug
###### initial error.pug contents:
```pug
extends layout.pug

block content
  div
    p= message || 'An unexpected error occurred on the server.'
  if stack
    h3 Stack Trace
    pre= stack
```
###### initial page-not-found.pug contents:
```pug
extends layout.pug

block contents
  div
    p Sorry, we couldn't find the page that your requested.
```