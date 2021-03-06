var express = require('express');
var router = express.Router();
var appError = require('../service/appError');
var handleErrorAsync = require('../service/handleErrorAsync');
const Posts = require('../models/postsModel');
const Users = require('../models/usersModel');
const Comment = require('../models/commentsModel');
const {isAuth,generateSendJWT} = require('../service/auth');

// 取得所有 posts
router.get('/', handleErrorAsync(async (req, res, next) => {
  const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt"
  const q = req.query.q !== undefined ? { "content": new RegExp(req.query.q) } : {};
  // populate 對應 schema 內的欄位
  const posts = await Posts.find(q).populate({
    path: 'user',
    select: 'name photo'
  }).populate({
    path: 'comments',
    select: 'comment user'
  }).sort(timeSort)
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
}));

// 新增一筆 posts
router.post('/', isAuth, handleErrorAsync(async (req, res, next) => {
  const { content } = req.body;

  if (content == undefined) {
    return next(appError(400, "你沒有填寫 content 資料", next))
  }
  
  const newPost = await Posts.create({
    user: req.user.id,
    content
  });

  res.status(200).json(
    {
      "status": "success",
      "data": newPost
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

// 新增讚
router.post('/:id/likes', isAuth, handleErrorAsync(async (req, res, next) => {
  // 此 :id 為貼文 ID
  const _id = req.params.id;
  await Posts.findOneAndUpdate(
      { _id },
      { $addToSet: { likes: req.user.id } }
    );
    res.status(201).json({
      status: 'success',
      postId: _id,
      userId: req.user.id
    });
}));


// 刪除讚
router.delete('/:id/likes', isAuth, handleErrorAsync(async (req, res, next) =>  {
  const _id = req.params.id;
  await Posts.findOneAndUpdate(
      { _id },
      { $pull: { likes: req.user.id } }
    );
    res.status(201).json({
      status: 'success',
      postId: _id,
      userId: req.user.id
    });
}));

// 個人貼文列表
router.get('/user/:id', handleErrorAsync(async(req, res, next) =>  {
  // :id 為 user ID
  const user = req.params.id;
  const posts = await Posts.find({user});

  res.status(200).json({
      status: 'success',
      results: posts.length,
      posts
  });
}));

// 留言
router.post('/:id/comment',isAuth, handleErrorAsync(async(req, res, next) =>  {
  const user = req.user.id;
  const post = req.params.id;
  const {comment} = req.body;
  const newComment = await Comment.create({
    post,
    user,
    comment
  });
  res.status(201).json({
      status: 'success',
      data: {
        comments: newComment
      }
  });

}))

module.exports = router;
