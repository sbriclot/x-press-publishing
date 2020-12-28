const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const apiRouter = require('./api/api');

//open express app
const app = express();

//set default port
const PORT = process.env.PORT || 4000;

//init morgan log level
morgan('short');

//init body-parser, cors and errorhandler
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

//init API Router
app.use('/api', apiRouter);

app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`) });

module.exports = app;
