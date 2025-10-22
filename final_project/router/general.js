const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
// Function to check if the user exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

// Function to check if the user is authenticated
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

public_users.post("/register", (req,res) => {
   const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    if (books) resolve(books);
    else reject("No books available");
  })
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500).json({ message: err }));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject("Book not found");
      });
    };

    const book = await getBookByISBN(isbn);
    res.status(200).json(book);

  } catch (error) {
    res.status(404).json({ message: error });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();

    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(
          (book) => book.author.toLowerCase() === author
        );
        if (matchingBooks.length > 0) resolve(matchingBooks);
        else reject("Author not found");
      });
    };

    const matchingBooks = await getBooksByAuthor(author);
    res.status(200).json(matchingBooks);

  } catch (error) {
    res.status(404).json({ message: error });
  }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {

  try {
    const title = req.params.title.toLowerCase();

    const getBookByTitle = (title) => {
      return new Promise((resolve, reject) => {
          const matchingBooks = Object.values(books).filter(
            (book) => book.title.toLowerCase() === title
          );
          if (matchingBooks.length > 0) resolve(matchingBooks);
          else reject("Title not found");
      });
    };
      const matchingBooks = await getBookByTitle(title);
      res.status(200).json(matchingBooks);


  } catch (error){
    res.status(404).json({ message: error});
  }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    let book = books[isbn];
       // Check if the book exists
    if (book) {
        return res.status(200).json(book["reviews"]);
    } else {
        return res.status(404).json({ message: "isbn provided not found" });
    }
});

module.exports.general = public_users;
