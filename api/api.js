const express = require('express');
const apiRouter = express.Router();

const artistsRouter = require('./artists');
const seriesRouter = require('./series');
const issuesRouter = require('./issues');

//mount artists Router
apiRouter.use('/artists', artistsRouter);
//mount series Router
apiRouter.use('/series', seriesRouter);
//mount series Router
apiRouter.use('/:seriesId/issues', issuesRouter);

module.exports = apiRouter;
