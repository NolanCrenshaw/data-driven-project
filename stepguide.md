# Data Driven Project Guide

### Initial Steps

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
###### initial 'routes.js' contents:
```js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

module.exports = router;
```

##### setup app module
        $ touch app.js
###### initial 'app.js' contents:
```js
const express = require('express');
const routes = require('./routes');
const app = express();

app.set('view engine', 'pug');
app.use(routes);

const port = 8080;

app.listen(port, () => console.log(`Listening on port: ${port}...`));
```

##### create subdirectory 'views'
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
```json
"scripts": {
    "start": "nodemon app.js"
},
```

------------------

### Improving the Application

*Separating server and application modules*

##### reconfigure app module
*Replace port declaration and 'app.listen()' with 'module.exports' statement to export the 'app' object.*

##### create subdirectory 'bin'
        $ mkdir bin
        $ touch bin/www
*IMPORTANT - do not add a file extension to 'www'.*
###### initial 'www' contents:
```js
#!/usr/bin/env node

const app = require('../app');
const port = 8080;

app.listen(port, () => console.log(`Listening on port: ${port}...`));
```

##### update 'package.json' start script to target './bin/www'
```json
"scripts": {
    "start": "nodemon ./bin/www"
},
```
*Hard restarting nodemon may be required to activate server.*

------------

### Using the 'Morgan' HTTP request logger

##### install 'morgan'
        $ npm install morgan
##### update 'app' module
```js
const morgan = require('morgan');
app.use(morgan('dev'));
```
------------

### Custom Error Handling

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
###### initial 'error.pug' contents:
```pug
extends layout.pug

block content
  div
    p= message || 'An unexpected error occurred on the server.'
  if stack
    h3 Stack Trace
    pre= stack
```
###### initial 'page-not-found.pug' contents:
```pug
extends layout.pug

block content
  div
    p Sorry, we couldn't find the page that your requested.
```

------------

### Pre-Database Package Setup

*The package 'per-env' allows npm to utilize scripts on a per-environment basis by a slight modification to the package.json "script:" object.*
*The package 'dotenv' and its command line package 'dotenv-cli' add the project access to '.env' files that define your environment variables and can be imported by the project. The command line package serves as an intermediary between your database management package and the environment controls.*

##### install per-env
        $ npm install per-env
        $ npm install dotenv dotenv-cli --save-dev
*The '--save-dev' is crucial here, as it is with the 'nodemon' package. This ensures that the package is deployed specifically to a development environment and will not interfere with the eventual deployment environment.*

##### create necessary '.env' files to reference
        $ touch .env
        $ touch .env.example
###### initial '.env' contents:
```env
PORT=8080
```
*IMPORTANT - Add '.env' files to .gitignore, as they often contain sensitive information.*
##### create 'config' module
        $ mkdir config
        $ touch config/index.js
###### initial 'config/index.js' content:
```js
module.exports = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080,
};
```
##### update '.bin/www' to get port from the 'config' module
```js
#!/usr/bin/env node
const { port } = require('../config');
const app = require('../app');

app.listen(port, () => console.log(`Listening on port: ${port}...`));
```
##### update 'package.json' npm start script
```json
  "scripts": {
    "start": "per-env",
    "start:development": "nodemon -r dotenv/config ./bin/www",
    "start:production": "node ./bin/www"
  },
```

##### configure VSCode debug
*If there is no '.vscode' directory with a 'launch.json' file, simply open VSCode's debugger extension and select the option to create that subdirectory.*
##### configure the 'launch.json' file inside the .vscode subdirectory
```json
"version": "0.2.0",
"configurations": [
    {
        "type": "node",
        "request": "launch",
        "name": "Launch Program",
        "skipFiles": [
            "<node_internals>/**"
        ],
        "program": "${workspaceFolder}/bin/www",
        "envFile": "${workspaceFolder}/.env"
    }
]
```

##### setup bootstrap
*See 'layout.pug' file for bootstrap implementation example. Meta tags, classes, and script tags are applied where needed. See BootStrap documentation for reference.*

---------------

### Applying the Database Structure

*Using PostgreSQL and Sequelize*

##### install dependencies:
        $ npm install sequelize@^5.0.0 pg@^8.0.0
        $ npm install sequelize-cli@^5.0.0 --save-dev
##### configure sequelize-cli
        $ touch .sequelizerc
##### initial contents of '.sequelizerc'
```js
const path = require('path');

module.exports = {
    'config': path.resolve('config', 'database.js'),
    'models-path': path.resolve('db', 'models'),
    'seeders-path': path.resolve('db', 'seeders'),
    'migrations-path': path.resolve('db', 'migrations')
};
```
##### initialize sequelize
        $ npx sequelize init
##### create new database and database user for project
        $ psql
        sudo=# CREATE DATABASE reading_list;
        sudo=# CREATE USER reading_list_app WITH ENCRYPTED PASSWORD 'password';
        sudo=# GRANT ALL PRIVILEGES ON DATABASE reading_list TO reading_list_app;
##### update '.env' and '.env example' files with database information
```env
PORT=8080
DB_USERNAME=reading_list_app
DB_PASSWORD=password
DB_DATABASE=reading_list
DB_HOST=localhost
```
##### update config module at 'config/index.js'
```js
module.exports = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080,
    db: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
    },
};
```
##### configure the sequelize database connection at 'config/database.js'
```js
const {
  username,
  password,
  database,
  host,
} = require('./index').db;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'postgres',
  },
};
```
##### configure 'bin/www' to test the database connection on start
```js
#!/usr/bin/env node
const { port } = require('../config');
const app = require('../app');
const db = require('../db/models');

db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection success! Sequelize is ready to use...');
        app.listen(port, () => console.log(`Listening on port: ${port}...`));
    })
    .catch((err) => {
        console.log('Database connection failure.')
        console.error(err);
    });
```
-----------

### Creating the Content Models

##### npx model generation
        $ npx sequelize model:generate \
        --name Book \
        --attributes "title:string,author:string,releaseDate:dateonly,pageCount:integer,publisher:string"
##### update model and migration files
```js
//- db/models/book.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    publisher: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Book.associate = function(models) {
    // associations can be defined here
  };
  return Book;
};

//- db/migrations/xxxx-create-book.js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      author: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      releaseDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      pageCount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      publisher: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Books');
  }
};
```
##### apply the migration
        $ npx dotenv sequelize db:migrate
##### generate the seeder file
        $ npx sequelize seed:generate --name test-data
##### replace contents of seeder file
*See example file in 'db/seeders' for code*
##### seed database
        $ npx dotenv sequelize db:seed:all

### Rendering Database

##### update 'routes' module 
```js
const express = require('express');

const db = require('./db/models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const books = await db.Book.findAll({ order: [['title', 'ASC'] ]});
        res.render('index', { title: 'Home', books });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
```
##### update './views/index.pug' to render the array of book objects
```pug

```



