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

server.get('/show',(req,res)=>{
  res.render('./pages/searches/show');
  console.log('you are in the main page !');
//   console.log('search done');
});


server.get('/search',(req,res)=>{
  res.render('./pages/new');
  console.log('You are in the search page!');

});


server.get('/show',(req,res)=>{
  res.render('./pages/show');
  console.log('You are in the search page!');

});





server.post('/searches',(req,res)=>{
  let keyword = req.body.keyword;
  let search_by = req.body.search_by;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${search_by}:${keyword}`;
  superagent.get(url)
    .then(booksdata => {
      console.log(booksdata.body.items);
      res.render('pages/searches/show',{booksArr:booksdata.body.items});
    });

});





