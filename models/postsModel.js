const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema({
  photo: {
    type: String
  },
  createAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  content: {
    type: String,
    required: [true, "content 未填寫"],
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, "貼文 id 未填寫"],
  }
}, {
  versionKey: false
});

const posts = mongoose.model("posts", postsSchema);

module.exports = posts;