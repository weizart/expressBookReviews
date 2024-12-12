const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // 检查用户名是否存在
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // 检查用户名和密码是否匹配
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  // 检查是否提供了用户名和密码
  if (!username || !password) {
    return res.status(400).json({message: "请提供用户名和密码"});
  }

  // 验证用户
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "用户名或密码错误"});
  }

  // 生成JWT令牌
  const token = jwt.sign({ username: username }, "access", { expiresIn: '1h' });
  
  // 将令牌保存到会话中
  req.session.authorization = {
    accessToken: token
  };

  return res.status(200).json({
    message: "登录成功",
    token: token
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // 获取ISBN和评论内容
  const isbn = req.params.isbn;
  const review = req.query.review;
  
  // 检查书籍是否存在
  if (!books[isbn]) {
    return res.status(404).json({message: `ISBN ${isbn} 的书籍未找到`});
  }

  // 检查是否提供了评论
  if (!review) {
    return res.status(400).json({message: "请提供评论内容"});
  }

  // 从会话中获取用户信息
  const username = req.user.username;
  
  // 如果这本书还没有评论，初始化评论对象
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  // 添加或更新评论
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({
    message: "评论已添加/更新",
    isbn: isbn,
    user: username,
    review: review
  });
});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  // 检查书籍是否存在
  if (!books[isbn]) {
    return res.status(404).json({message: `ISBN ${isbn} 的书籍未找到`});
  }

  // 检查书籍是否有评论
  if (!books[isbn].reviews) {
    return res.status(404).json({message: "该书籍没有任何评论"});
  }

  // 检查用户是否有对这本书的评论
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "您没有对这本书发表过评论"});
  }

  // 删除评论
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "评论已成功删除",
    isbn: isbn,
    user: username
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
