const express = require('express');
const apiRouter = express.Router();

const artistsRouter = require('./artists');
const seriesRouter = require('./series');

//mount artists Router
apiRouter.use('/artists', artistsRouter);
//mount series Router
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;
