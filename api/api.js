const express = require('express');
const apiRouter = express.Router();

const artistsRouter = require('./artists');

//mount artists Router
apiRouter.use('/artists', artistsRouter);

module.exports = apiRouter;
