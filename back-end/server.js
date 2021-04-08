const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/library', {
  useNewUrlParser: true
});

// Configure multer so that it will upload to '../front-end/public/images'
const multer = require('multer')
const upload = multer({
  dest: '../front-end/public/images',
  limits: {
    fileSize: 10000000
  }
});

// Create a scheme for users
const userSchema = new mongoose.Schema({
  username: String,
});

// Create a model for users
const User = mongoose.model('User', userSchema);

// Create a user
app.post('/api/users', async (req, res) => {
  const user = new User({
    username: req.body.username,
  });
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// edit a user
app.put('/api/users/:id', async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.params.id
    });
    user.username = req.body.username;
    user.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all users
app.get('/api/users', async (req, res) => {
  try {
    let users = await User.find();
    res.send(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Delete a user from the library
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.deleteOne({
      _id: req.params.id
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});


// Create a scheme for books in the library: a title, series, author, rating, and a path to an image.
//TODO: add rating.
const bookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  title: String,
  author: String,
  series: String,
  path: String,
});

//Create a way to use id instead of _id
bookSchema.virtual('id')
  .get(function() {
    return this._id.toHexString();
  });

//Create a way to use id instead of _id
userSchema.virtual('id')
  .get(function() {
    return this._id.toHexString();
  });

// Create a model for books in the library.
const Book = mongoose.model('Book', bookSchema);



// Upload a photo. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/images/" + req.file.filename
  });
});

// Add out a book to the library using a title, series, author, rating, and a path to an image.
app.post('/api/users/:userID/books', async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.params.userID
    });
    if (!user) {
      res.send(404);
      return;
    }
    const book = new Book({
      user: user,
      title: req.body.title,
      author: req.body.author,
      series: req.body.series,
      path: req.body.path,
    });
    await book.save();
    res.send(book);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the books in the library.
app.get('/api/users/:userID/books', async (req, res) => {
  try {
    /*let user = await User.findOne({
      _id: req.params.userID
    });
    if (!user) {
      res.send(404);
      return;
    }*/
    let books = await Book.find().populate('user');
    console.log("Population test:");
    console.log(books);
    res.send(books);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the books currently checked out.
app.get('/api/users/:userID/checkouts', async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.params.userID
    });
    if (!user) {
      res.send(404);
      return;
    }
    let books = await Book.find({
      user: user
    });
    res.send(books);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//edit a library book's information
app.put('/api/users/:userID/books/:bookID', async (req, res) => {
  try {
    let book = await Book.findOne({
      _id: req.params.bookID
    });
    if (!book) {
      res.send(404);
      return;
    }
    book.title = req.body.title;
    book.series = req.body.series;
    book.author = req.body.author;
    await book.save();
    res.send(book);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//check out a library book
app.put('/api/users/:userID/checkouts/:bookID', async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.params.userID
    });
    if (!user) {
      res.send(404);
      return;
    }
    let book = await Book.findOne({
      _id: req.params.bookID
    });
    if (!book) {
      res.send(404);
      return;
    }
    book.user = user;
    await book.save();
    res.send(book);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
//return a library book
app.put('/api/users/:userID/return/:bookID', async (req, res) => {
  try {
    let user = await User.findOne({
      username: "Admin"
    });
    if (!user) {
      res.send(404);
      return;
    }
    let book = await Book.findOne({
      _id: req.params.bookID
    });
    if (!book) {
      res.send(404);
      return;
    }
    book.user = user;
    await book.save();
    res.send(book);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
//deletes a book
app.delete('/api/users/:userID/books/:bookID', async (req, res) => {
  try {
    let book = await Book.findOne({
      _id: req.params.bookID
    });
    if (!book) {
      res.send(404);
      return;
    }
    await book.delete();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



app.listen(3001, () => console.log('Server listening on port 3001!'));
