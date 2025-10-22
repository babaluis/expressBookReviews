const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
 let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
   const isbn = req.params.isbn;
   let book = books[isbn];
   if (book) {  // Check if friend exists
        let reviews = req.body.reviews;

        // Update review if provided in request body
        if (reviews) {
            book["reviews"] = reviews;
        }
   
        books[reviews] = book;  // Update review details in 'books' object
        res.send(`Review of  isbn ${isbn} updated.`);
    } else {
        // Respond if friend with specified email is not found
        res.send("Unable to find ISBN!");
    }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// DELETE request: Delete a book by isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract email parameter from request URL
    const isbn = req.params.isbn;

    if (isbn) {
        // Delete book from 'books' object based on provided isbn
        delete books[isbn];
    }
    
    // Send response confirming deletion of friend
    res.send(`Book with the isbn ${isbn} deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
