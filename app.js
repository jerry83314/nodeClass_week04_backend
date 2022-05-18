var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// 連接資料庫
mongoose.connect(DB)
  .then(() => {
    console.log('連接資料庫成功')
  })

var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

// 404 錯誤
app.use(function(req, res, next) {
  res.status(404).json({
    status: 'error',
    message: "無此路由資訊",
  });
});

// express 錯誤處理
app.use(function(err,req,res,next){
  res.status(500).json({
      "err": err.message
  })
})

module.exports = app;