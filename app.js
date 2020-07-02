// external import statements
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// internal import statements
const routes = require('./routes');

// app object initialization
const app = express();

// view engine attribute set
app.set('view engine', 'pug');

// app-global modules applied
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(routes);

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


module.exports = app;
