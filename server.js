'use strict';
const express = require('express');
const server = express();
const pg = require('pg');
require('dotenv').config();
const cors = require('cors');
const methodOverride = require('method-override');
const superagent = require('superagent');
server.use(cors());
server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));
server.use(express.static('./public'));
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 5000;
server.use(methodOverride('_method'));


client
  .connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  });


server.get('/', (req, res) => {
  let SQL = `SELECT * FROM books`;
  client.query(SQL)
    .then(datas => {
      res.render('pages/home', { data: datas.rows });
    });
});

server.get('/hello', (req, res) => {
  res.render('pages/index');
});

server.get('/new', (req, res) => {
  res.render('pages/searches/new');
});


server.post('/searches', (req, res) => {
  let name = req.body.name;
  let search_by = req.body.search_by;
  let newBooks = [];
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${name}:${search_by}`;
  superagent.get(url)
    .then(data => {
      // res.send(data.body)
      data.body.items.forEach(element => {
        let newBook = new Book(element.volumeInfo);
        newBooks.push(newBook);
      });
      res.render('pages/searches/show', { books: newBooks });
    });
});


server.post('/books', (req, res) => {
  let { image_url, title, author, description, ISBN } = req.body;
  let SQL = `INSERT INTO books (title,author,description,image_url,ISBN) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
  let safeValues = [title, author, description, image_url, ISBN];
  client.query(SQL, safeValues)
    .then(data => {
      res.redirect(`/books/${data.rows[0].id}`);
    });
});


server.get('/books/:id', (req, res) => {
  let id = req.params.id;
  let SQL = `SELECT * FROM books WHERE id = $1`;
  let safeValues = [id];
  client.query(SQL, safeValues)
    .then(data => {
      res.render('pages/books/detail', { single: data.rows[0] });
    });
});

server.put('/updateBook/:id', (req, res) => {
  let { image_url, title, author, description, ISBN } = req.body;
  let SQL = `UPDATE books SET title=$1, author=$2, description=$3, image_url=$4, ISBN=$5 WHERE id=$6;`
  let safeValues = [title, author, description, image_url, ISBN, req.params.id];
  client.query(SQL, safeValues)
    .then(() => {
      res.redirect(`/books/${req.params.id}`);
    });
});

server.delete('/deleteBook/:id', (req, res) => {

  let SQL = `DELETE FROM books WHERE id=$1;`;
  let safeValues = [req.params.id];
  client.query(SQL, safeValues)
    .then(() => {
      res.redirect('/');
    });

});

server.get('*', (req, res) => {
  res.render('pages/error');
});

function Book(element) {
  this.title = element.title;
  this.author = element.authors;
  this.description = element.description;
  this.image_url = element.imageLinks.thumbnail || element.imageLinks.smallThumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.ISBN = `${element.industryIdentifiers[0].type}  ${element.industryIdentifiers[0].identifier}`;
}
