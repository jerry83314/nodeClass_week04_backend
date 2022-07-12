const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema({
  photo: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: [true, "content 未填寫"],
  },
  likes: [
    { 
      type: mongoose.Schema.ObjectId, 
      ref: 'users' 
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    // ref 對應 usersModel
    ref: 'users',
    required: [true, "貼文 id 未填寫"],
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postsSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
});

const posts = mongoose.model("posts", postsSchema);

module.exports = posts;