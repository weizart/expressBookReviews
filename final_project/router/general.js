const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// 使用Promise获取所有书籍
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch(error) {
      reject(error);
    }
  });
}

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // 检查是否提供了用户名和密码
  if (!username || !password) {
    return res.status(400).json({message: "用户名和密码都是必需的"});
  }

  // 检查用户名是否已存在
  if (users.length > 0) {
    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({message: "用户名已存在"});
    }
  }

  // 创建新用户
  const newUser = {
    username: username,
    password: password
  };
  users.push(newUser);

  return res.status(201).json({message: "用户注册成功", user: username});
});

// Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const books = await getAllBooks();
    res.status(200).json(books);
  } catch(error) {
    res.status(500).json({message: "获取书籍列表时出错", error: error.message});
  }
});

// 使用Promise获取特定ISBN的书籍
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error(`ISBN ${isbn} 的书籍未找到`));
      }
    } catch(error) {
      reject(error);
    }
  });
}

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch(error) {
    res.status(404).json({message: error.message});
  }
});

// 使用Promise获取特定作者的书籍
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    try {
      const booksByAuthor = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
          booksByAuthor[isbn] = books[isbn];
        }
      });
      
      if (Object.keys(booksByAuthor).length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error(`未找到作者 ${author} 的书籍`));
      }
    } catch(error) {
      reject(error);
    }
  });
}
  
// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    res.status(200).json(booksByAuthor);
  } catch(error) {
    res.status(404).json({message: error.message});
  }
});

// 使用Promise获取特定标题的书籍
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      const booksByTitle = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
          booksByTitle[isbn] = books[isbn];
        }
      });
      
      if (Object.keys(booksByTitle).length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error(`未找到标题为 ${title} 的书籍`));
      }
    } catch(error) {
      reject(error);
    }
  });
}

// Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await getBooksByTitle(title);
    res.status(200).json(booksByTitle);
  } catch(error) {
    res.status(404).json({message: error.message});
  }
});

// 使用Promise获取书籍评论
const getBookReviews = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      const book = books[isbn];
      if (book) {
        resolve({
          isbn: isbn,
          reviews: book.reviews || {}
        });
      } else {
        reject(new Error(`ISBN ${isbn} 的书籍未找到`));
      }
    } catch(error) {
      reject(error);
    }
  });
}

// Get book review using async-await
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const reviews = await getBookReviews(isbn);
    res.status(200).json(reviews);
  } catch(error) {
    res.status(404).json({message: error.message});
  }
});

module.exports.general = public_users;
