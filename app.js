const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');


const appDebug = require('debug')('appDebug');
const name = "myApp";

appDebug("booting o%", name);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');

const compression = require('compression');
const helmet = require('helmet');

// Create the Express application obj
const app = express();



// tyring to restructure app.js to eliminate need for ./bin/www
const http = require('http');
/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  appDebug('Listening on ' + bind);
}


// set up mongoose and mongoDB connection
// var mongoose = require('mongoose');
// var mongoDB = 'mongodb://jon:supersecretpassword123@ds161285.mlab.com:61285/local_library';
// mongoose.connect(mongoDB, { useNewUrlParser: true });
// mongoose.Promise = global.Promise;
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, "MongoDB connection error:"));

// setup mongoose via MERN Stack Front-to-Back class 
// const db = require("./config/keys").mongoURI;

// setup mongoDB via MDN-Express-LocalLibrary-Tutorial
const dev_db_url = "mongodb://jon:supersecretpassword123@ds161285.mlab.com:61285/local_library";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

// Connect to mLab w/ JS Promise
mongoose
  // .connect(db, { useNewUrlParser: true }) // From MERN Stack Front-to-Back class
  .connect(mongoDB, { useNewUrlParser: true }) // From MDN-Express-LocalLibrary-Tutorial
  // .then(() => console.log("MongoDB Connected!"))
  .then(() => appDebug("MongoDB Connected!"))
  .catch(err => {
    // console.log(err);
    appDebug("mongoose error: " + err);
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

// app.

//   module.exports = app;
