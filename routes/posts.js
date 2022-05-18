var express = require('express');
var router = express.Router();
var appError = require('../service/appError');
var handleErrorAsync = require('../service/handleErrorAsync');
const Posts = require('../models/postsModel');
const Users = require('../models/usersModel');

// 取得所有 posts
router.get('/', handleErrorAsync(async (req, res, next) => {
  const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt"
  const q = req.query.q !== undefined ? { "content": new RegExp(req.query.q) } : {};
  const posts = await Posts.find(q).populate({
    path: 'user',
    select: 'name photo'
  }).sort(timeSort)
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
}));

// 新增一筆 posts
router.post('/', handleErrorAsync(async (req, res, next) => {
  const data = req.body;
  if (req.body.content == undefined) {
    return next(appError(400, "你沒有填寫 content 資料", next))
  }
  await Posts.create({
    user: data.user,
    photo: data.photo,
    content: data.content,
    likes: 0,
    comments: 0
  });
  const posts = await Posts.find();
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
}));

// 刪除全部 posts
router.delete('/', handleErrorAsync(async (req, res, next) => {
  await Posts.deleteMany({});
  const posts = await Posts.find();
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
}));

// 刪除單筆 posts
router.delete('/:id', handleErrorAsync(async (req, res, next) => {
  const { id } = req.params;
  await Posts.findByIdAndDelete(id);
  const posts = await Posts.find();
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
}));

// 更新單筆 posts
router.patch('/:id', handleErrorAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  if (data.content !== '' && data.content !== undefined) {
    await Posts.findByIdAndUpdate(id, data, {
      runValidators: true
    });
    const posts = await Posts.find();
    res.status(200).json(
      {
        "status": "success",
        "data": posts
      }
    );
  } else {
    next(appError(400, "你沒有填寫 content 資料", next));
  }
}));

module.exports = router;
