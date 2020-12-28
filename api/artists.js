const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const app = require('../server');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
  db.all(`SELECT *
          FROM   Artist
          WHERE  is_currently_employed = 1`, (error, artists) => {
            if (error) {
              next(error);
            } else {
              res.status(200).json({ artists: artists });
            }
          });
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get(`SELECT * FROM Artist WHERE Artist.id = ${artistId}`, (error, artist) => {
    if (error) {
      next(error);
    } else if (artist) {
      req.artist = artist;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

const validatesRequired = (req, res, next) => {
  //check if mandatory fields are present
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  if (!name || !dateOfBirth || !req.body.artist.biography) {
    return res.sendStatus(400);
  }
  next();
};

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});

artistsRouter.post('/', validatesRequired, (req, res, next) => {
  //if isCurrentlyEmployed is empty, set it to 1
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed || 1;

  //insert the new artist
  db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
          VALUES($name, $date, $bio, $current);`,
          {
            $name: req.body.artist.name,
            $date: req.body.artist.dateOfBirth,
            $bio: req.body.artist.biography,
            $current: isCurrentlyEmployed
          },
          function(error){
            if (error) {
              next(error);
            } else {
              db.get(`SELECT *
                      FROM   Artist
                      WHERE  id = $id`,
                     { $id: this.lastID },
                     (error, artist) => {
                       if (artist) {
                        res.status(201).json({ artist: artist });
                       }
                     });
            }
          });

});
        
//update an artist
artistsRouter.put('/:artistId', validatesRequired, (req, res, next) => {
  db.run(`UPDATE Artist
          SET    name = $name,
                 date_of_birth = $date,
                 biography = $bio,
                 is_currently_employed= $current
          WHERE  id = $artistId;`,
         {
           $name: req.body.artist.name,
           $date: req.body.artist.dateOfBirth,
           $bio: req.body.artist.biography,
           $current: req.body.artist.isCurrentlyEmployed,
           $artistId: req.params.artistId
         },
         (error) => {
           if (error) {
             next(error);
           } else {
             db.get(`SELECT *
                     FROM   Artist
                     WHERE  id = ${req.params.artistId}`,
                     (error, artist) => {
                       res.status(200).json({ artist: artist });
                     });
           }
         });
});

//delete an artist
artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run(`UPDATE Artist
          SET    is_currently_employed = 0
          WHERE  id = ${req.params.artistId};`,
         (error) => {
           if (error) {
             next(error);
           } else {
             db.get(`SELECT *
                     FROM   Artist
                     WHERE  id = ${req.params.artistId}`,
                     (error, artist) => {
                       res.status(200).json({ artist: artist });
                     });
           }
         });
});

module.exports = artistsRouter;
