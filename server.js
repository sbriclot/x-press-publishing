const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

// open express app
const app = express();

// set default port
const PORT = process.env.PORT || 4000;

// init morgan log level
morgan('short');

//init body-parser, cors and errorhandler
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`) });

module.exports = app;
