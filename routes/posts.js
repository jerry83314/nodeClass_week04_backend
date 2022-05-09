var express = require('express');
var router = express.Router();
const Posts = require('../models/postsModel');

// 取得所有 posts
router.get('/', async (req, res, next) => {
  const posts = await Posts.find();
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
});

// 新增一筆 posts
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    await Posts.create({
      name: data.name,
      tags: data.tags,
      type: "",
      image: "",
      createAt: "",
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
  } catch (error) {
    res.status(400).json(
      {
        "status": "false",
        "message": "格式錯誤",
        "error": error
      }
    );
  }
});

// 刪除全部 posts
router.delete('/', async (req, res, next) => {
  await Posts.deleteMany({});
  const posts = await Posts.find();
  res.status(200).json(
    {
      "status": "success",
      "data": posts
    }
  );
});

// 刪除單筆 posts
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Posts.findByIdAndDelete(id);
    const posts = await Posts.find();
    res.status(200).json(
      {
        "status": "success",
        "data": posts
      }
    );
  } catch (error) {
    res.status(400).json(
      {
        "status": "false",
        "message": "無此 ID",
        "error": error
      }
    );
  }
});

// 更新單筆 posts
router.patch('/:id', async (req, res, next) => {
  try {
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
      res.status(400).json(
        {
          "status": "false",
          "message": "content 未填寫",
          "error": error
        }
      );
    }
  } catch (error) {
    res.status(400).json(
      {
        "status": "false",
        "message": "無此 ID或格式錯誤",
        "error": error
      }
    );
  }
});

module.exports = router;
