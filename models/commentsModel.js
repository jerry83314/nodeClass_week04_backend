const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'comment can not be empty!']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      // ref 對應 usersModel
      ref: 'users',
      require: ['true', 'user must belong to a post.']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      // ref 對應 postsModel
      ref: 'posts',
      require: ['true', 'comment must belong to a post.']
    }
  }
);

// 當 routes 有執行 .find() 時，觸發下面的 code
commentSchema.pre(/^find/, function (next) {
  // 連結 user collection
  this.populate({
    path: 'user',
    select: 'name id createdAt'
  })
  // .populate({
  //   path: 'post',
  //   select: 'content'
  // });

  next();
});
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;