const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const app = require('../server');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (error, series) => {
          if (error) {
            next(error);
          } else {
            res.status(200).json({ series: series });
          }
  });
});

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  // const sql = `SELECT * FROM Series WHERE id = ${seriesId}`;
  // const values = {$seriesId: seriesId};
  db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (error, series) => {
    if (error) {
      next(error);
    } else if (series) {
      req.series = series;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

const validatesRequired = (req, res, next) => {
  //check if mandatory fields are present
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }
  next();
};

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({ series: req.series });
});

seriesRouter.post('/', validatesRequired, (req, res, next) => {
  //insert the new series
  db.run(`INSERT INTO Series (name, description)
          VALUES($name, $description);`,
          {
            $name: req.body.series.name,
            $description: req.body.series.description
          },
          function(error){
            if (error) {
              next(error);
            } else {
              db.get(`SELECT *
                      FROM   Series
                      WHERE  id = $id`,
                     { $id: this.lastID },
                     (error, series) => {
                       if (series) {
                        res.status(201).json({ series: series });
                       }
                     });
            }
          });

});

//update a series
seriesRouter.put('/:seriesId', validatesRequired, (req, res, next) => {
  db.run(`UPDATE Series
          SET    name = $name,
                 description = $description
          WHERE  id = $seriesId;`,
         {
           $name: req.body.series.name,
           $description: req.body.series.description,
           $seriesId: req.params.seriesId
         },
         (error) => {
           if (error) {
             next(error);
           } else {
             db.get(`SELECT *
                     FROM   Series
                     WHERE  id = ${req.params.seriesId}`,
                     (error, series) => {
                       res.status(200).json({ series: series });
                     });
           }
         });
});

module.exports = seriesRouter;
