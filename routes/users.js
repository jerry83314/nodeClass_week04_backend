const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const appError = require('../service/appError'); 
const jwt = require('jsonwebtoken');
const handleErrorAsync = require('../service/handleErrorAsync');
const validator = require('validator');
const Users = require('../models/usersModel');
const Posts = require('../models/postsModel');
const { isAuth, generateSendJWT } = require('../service/auth');

// 取得所有 users
router.get('/', async (req, res, next) => {
  const users = await Users.find();
  res.status(200).json(
    {
      "status": "success",
      "data": users
    }
  )
});

// 註冊
router.post('/sign_up', handleErrorAsync(async(req, res, next) =>{
  let { email, password,confirmPassword,name } = req.body;
  // 內容不可為空
  if(!email||!password||!confirmPassword||!name){
    return next(appError("400","欄位未填寫正確！",next));
  }
  // 密碼正確
  if(password!==confirmPassword){
    return next(appError("400","密碼不一致！",next));
  }
  // 密碼 8 碼以上
  if(!validator.isLength(password,{min:8})){
    return next(appError("400","密碼字數低於 8 碼",next));
  }
  // 是否為 Email
  if(!validator.isEmail(email)){
    return next(appError("400","Email 格式不正確",next));
  }
  
  // 加密密碼
  password = await bcrypt.hash(password,12);
  const newUser = await Users.create({
    email,
    password,
    name
  });

  generateSendJWT(newUser,201,res);
}))

// 登入
router.post('/sign_in',handleErrorAsync(async(req,res,next)=>{
  const { email, password } = req.body;
  if (!email || !password) {
    return next(appError( 400,'帳號密碼不可為空',next));
  }
  // 找出當前使用者且撈出加密的密碼
  const user = await Users.findOne({ email }).select('+password');
  // 比對資料庫內的加密密碼
  const auth = await bcrypt.compare(password, user.password);

  if(!auth){
    return next(appError(400,'您的密碼不正確',next));
  }

  generateSendJWT(user,200,res);
}))

// 個人頁
router.get('/profile/',isAuth, handleErrorAsync(async(req, res, next) =>{
  res.status(200).json({
    status: 'success',
    user: req.user
  });
}))

// 更新密碼
router.post('/updatePassword',isAuth,handleErrorAsync(async(req,res,next)=>{
  const {password,confirmPassword } = req.body;
  if(password!==confirmPassword){
    return next(appError("400","密碼不一致！",next));
  }
  newPassword = await bcrypt.hash(password,12);
  
  const user = await Users.findByIdAndUpdate(req.user.id,{
    password:newPassword
  });
  generateSendJWT(user,200,res)
}))

// 更新個人頁
router.patch('/profile/',isAuth, handleErrorAsync(async(req, res, next) =>{
  const { id } = req.user;
  const { name } = req.body;

  await Users.findByIdAndUpdate(id, {
    name
  });

  const newUser = await Users.findById(id);

  res.status(200).json({
    status: 'success',
    user: newUser
  });
}))

// 個人按讚貼文列表
router.get('/getLikeList',isAuth, handleErrorAsync(async(req, res, next) =>{
  const likeList = await Posts.find({
    likes: { $in: [req.user.id] }
  }).populate({
    path:"user",
    select:"name _id"
  });
  res.status(200).json({
    status: 'success',
    likeList
  });
}))

module.exports = router;