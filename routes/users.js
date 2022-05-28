const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const appError = require('../service/appError'); 
const jwt = require('jsonwebtoken');
const handleErrorAsync = require('../service/handleErrorAsync');
const validator = require('validator');
const Users = require('../models/usersModel');

const generateSendJWT= (user,statusCode,res)=>{
  // 產生 JWT token
  const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    user:{
      token,
      name: user.name
    }
  });
}

const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appError(401,'你尚未登入！',next));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve,reject)=>{
    jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
      if(err){
        reject(err)
      }else{
        resolve(payload)
      }
    })
  })
  const currentUser = await Users.findById(decoded.id);

  req.user = currentUser;
  next();
});

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

module.exports = router;