const express = require('express');
const issuesRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//issues index
issuesRouter.get('/', (req, res, next) => {
  db.all(`SELECT *
          FROM   Issue
          WHERE  Issue.series_id = ${req.params.seriesId}`, (error, issues) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({issues: issues});
    }
  });
});

//issues param route
issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//check if mandatory fields are present, and test if the given artist exists
const validatesRequired = (req, res, next) => {
  const name = req.body.issue.name,
               issueNumber = req.body.issue.issueNumber,
               publicationDate = req.body.issue.publicationDate,
               artistId = req.body.issue.artistId;
  const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
  const artistValues = {$artistId: artistId};
  db.get(artistSql, artistValues, (error, artist) => {
    if (error) {
      return error;
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.sendStatus(400);
      }
    }
    next();
  });
};

//insert a new issue
issuesRouter.post('/', validatesRequired, (req, res, next) => {
  db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
          VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId);`,
          {
            $name: req.body.issue.name,
            $issueNumber: req.body.issue.issueNumber,
            $publicationDate: req.body.issue.publicationDate,
            $artistId: req.body.issue.artistId,
            $seriesId: req.params.seriesId
          },
          function(error){
            if (error) {
              next(error);
            } else {
              db.get(`SELECT *
                      FROM   Issue
                      WHERE  id = $id`,
                     { $id: this.lastID },
                     (error, issue) => {
                       if (issue) {
                        res.status(201).json({ issue: issue });
                       }
              });
            }
  });
});

//update an issue
issuesRouter.put('/:issueId', validatesRequired, (req, res, next) => {
  db.run(`UPDATE Issue
          SET    name = $name,
                 issue_number = $issueNumber,
                 publication_date = $publicationDate,
                 artist_id = $artistId
          WHERE  id = $issueId;`,
          {
            $name: req.body.issue.name,
            $issueNumber: req.body.issue.issueNumber,
            $publicationDate: req.body.issue.publicationDate,
            $artistId: req.body.issue.artistId,
            $issueId: req.params.issueId
          },
          (error) => {
            if (error) {
              next(error);
            } else {
              db.get(`SELECT *
                      FROM   Issue
                      WHERE  id = ${req.params.issueId}`,
                      (error, issue) => {
                        res.status(200).json({ issue: issue });
              });
            }
  });
});

// delete an issue
issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, (error, issue) => {
    if (error) {
      next(error);
    } else {
      res.status(204).send();
    }
  });
});

module.exports = issuesRouter;
