/**
 * FileQ
 * Copyright(C) Brad Huang
 * app.js: Node entry point
 */

////// INIT //////
const express = require('express');
const app = express();

const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const configs = require('./configs');

const indexRoutes = require('./routes/index');
const exceptionsRoutes = require('./routes/exceptions');

////// ESTABLISH DB CONNECTION //////
mongoose.connect(configs.DB_CONNECTION, { useNewUrlParser: true });
console.log("DB Connection Successful");

////// SET ENVIRONMENT VARIABLES //////
app.set('port', configs.PORT || 3001);
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

////// ADD ROUTES //////
app.use(indexRoutes);
app.use(exceptionsRoutes);

////// CREATE SERVER //////
app.listen(app.get('port'), () => {
    console.log('Server running on port ' + app.get('port'));
});
