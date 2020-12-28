const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues.js');
seriesRouter.use('/:seriesId/issues', issuesRouter);

//series index
seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (error, series) => {
          if (error) {
            next(error);
          } else {
            res.status(200).json({ series: series });
          }
  });
});

//series param route
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
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

//check if mandatory fields are present
const validatesRequired = (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }
  next();
};

//select 1 specific series
seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({ series: req.series });
});

//insert a new series
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

//delete a series
seriesRouter.delete('/:seriesId', (req, res, next) => {
  db.get(`SELECT *
          FROM Issue
          WHERE Issue.series_id = ${req.params.seriesId}`, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      db.run(`DELETE FROM Series WHERE Series.id = ${req.params.seriesId}`, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = seriesRouter;
