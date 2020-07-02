const express = require('express');

const routes = require('./routes');

const app = express();

app.set('view engine', 'pug');

app.use(routes);

const port = 8080;

app.listen(port, () => console.log(`Listening on port: ${port}...`));