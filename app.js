const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');

const expressDebug = require('debug')('expressDebug');
const name = "myApp";

expressDebug("booting o%", name);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');

const compression = require('compression');
const helmet = require('helmet');

// Create the Express application obj
const app = express();

// set up mongoose and mongoDB connection
// var mongoose = require('mongoose');
// var mongoDB = 'mongodb://jon:supersecretpassword123@ds161285.mlab.com:61285/local_library';
// mongoose.connect(mongoDB, { useNewUrlParser: true });
// mongoose.Promise = global.Promise;
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, "MongoDB connection error:"));

// setup mongoose via MERN Stack Front-to-Back class 
// const db = require("./config/keys").mongoURI;

// setup mongoose via MDN-Express-LocalLibrary-Tutorial database steps
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
const dev_db_url = "mongodb://jon:supersecretpassword123@ds161285.mlab.com:61285/local_library";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

// Connect to mLab w/ JS Promise
mongoose
  // .connect(db, { useNewUrlParser: true }) // MERN FTB method
  .connect(mongoDB, { useNewUrlParser: true }) // MDN-Express-LocalLibrary-Tutorial method
  // .then(() => console.log("MongoDB Connected!"))
  .then(() => expressDebug("MongoDB Connected!"))
  .catch(err => {
    // console.log(err);
    expressDebug("mongoose error: " + err);
  });


// Use Helmet
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));

// Compress all routes
app.use(compression());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
