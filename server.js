'use strict';
const express = require('express');
const server = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
server.use(cors());

server.set('view engine','ejs');
server.use(express.urlencoded({extended:true}));
server.use(express.static('./public'));


server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

server.get('/',(req,res)=>{
  res.render('./pages/index');
  console.log('you are in the main page');
});

server.get('/test',(req,res)=>{

  console.log('Hello , Welcome to book app! powered by Doaa obeidat ');



});


server.get('/search',(req,res)=>{
  res.render('./pages/searches/show');
  console.log('You are in the search page!');

});



server.get('/new',(req,res)=>{
  res.render('./pages/new');
  console.log('You are in the search page!');

});


server.post('/searches',(req,res)=>{
  let keyword = req.body.keyword;
  let search_by = req.body.search_by;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${search_by}:${keyword}`;
  superagent.get(url)
    .then(booksdata => {
      let result = booksdata.body.items.slice(0, 10);
      let formattedResutl = result.map(bookData => new Book(bookData));
      res.render('pages/searches/show', {books: formattedResutl});
    });

});






server.get('*',(req,res)=>{

  console.log('Sorry,something wrong');
});


function Book(data) {

  this.title = data.volumeInfo.title;
  this.auther = data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'Anonymous';
  this.description = data.volumeInfo.title;
}

