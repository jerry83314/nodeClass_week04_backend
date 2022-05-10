var express = require('express');
var router = express.Router();
const Users = require('../models/usersModel');

router.get('/', async (req, res, next) => {
  const users = await Users.find();
  res.status(200).json(
    {
      "status": "success",
      "data": users
    }
  )
});

module.exports = router;