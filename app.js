const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const logger = require('morgan');

const { userappPassportStrategy } = require('./config/userappPassportStrategy');
const { adminPassportStrategy } = require('./config/adminPassportStrategy');
const { googlePassportStrategy } = require('./config/googlePassportStrategy');

const path = require('path');
global.__basedir = __dirname;
// all routes
const routes = require("./routes")

const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const dbConnection = require('./config/db');
dbConnection();

const app = express();
const port = process.env.PORT || 8000;

app.use(require('./utils/response/responseHandler'));
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(session({
  secret: 'my-secret',
  resave: true,
  saveUninitialized: false
}));
app.use(routes)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

userappPassportStrategy(passport);
adminPassportStrategy(passport);
googlePassportStrategy(passport);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`your application is running on ${port}`);
    });
  } else {
    module.exports = app;
  }