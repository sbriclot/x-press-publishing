const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  //create table Artist
  db.run(`CREATE TABLE IF NOT EXISTS Artist(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            biography TEXT NOT NULL,
            is_currently_employed INTEGER DEFAULT 1
          );`);

  //create table Series
  db.run(`CREATE TABLE IF NOT EXISTS Series(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            DESCRIPTION TEXT NOT NULL
          );`);
})