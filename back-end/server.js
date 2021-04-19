const express = require('express');
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const mongoose = require('mongoose');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


// connect to the database
mongoose.connect('mongodb://localhost:27017/library', {
  useNewUrlParser: true
});

//configure cookies to work.
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: [
    'secretValue'
  ],
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


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
  firstName: String,
  lastName: String,
  username: String,
  password: String,
});

// This is a hook that will be called before a user record is saved,
// allowing us to be sure to salt and hash the password first.
userSchema.pre('save', async function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password'))
    return next();

  try {
    // generate a hash. argon2 does the salting and hashing for us
    const hash = await argon2.hash(this.password);
    // override the plaintext password with the hashed one
    this.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// This is a method that we can call on User objects to compare the hash of the
// password the browser sends with the has of the user's true password stored in
// the database.
userSchema.methods.comparePassword = async function(password) {
  try {
    // note that we supply the hash stored in the database (first argument) and
    // the plaintext password. argon2 will do the hashing and salting and
    // comparison for us.
    const isMatch = await argon2.verify(this.password, password);
    return isMatch;
  } catch (error) {
    return false;
  }
};

// This is a method that will be called automatically any time we convert a user
// object to JSON. It deletes the password hash from the object. This ensures
// that we never send password hashes over our API, to avoid giving away
// anything to an attacker.
userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
}

// Create a model for users
const User = mongoose.model('User', userSchema);

/* Middleware */

// middleware function to check for logged-in users
const validUser = async (req, res, next) => {
  if (!req.session.userID)
    return res.status(403).send({
      message: "not logged in"
    });
  try {
    const user = await User.findOne({
      _id: req.session.userID
    });
    if (!user) {
      return res.status(403).send({
        message: "not logged in"
      });
    }
    // set the user field in the request
    req.user = user;
  } catch (error) {
    // Return an error if user does not exist.
    return res.status(403).send({
      message: "not logged in"
    });
  }

  // if everything succeeds, move to the next middleware
  next();
};

/* API Endpoints */

// Create a user
app.post('/api/users', async (req, res) => {
  // Make sure that the form coming from the browser includes all required fields,
  // otherwise return an error. A 400 error means the request was
  // malformed.
  if (!req.body.firstName || !req.body.lastName || !req.body.username || !req.body.password)
    return res.status(400).send({
      message: "first name, last name, username and password are required"
    });

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
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
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
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

// login a user
app.post('/api/users/login', async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    //  lookup user record
    const user = await User.findOne({
      username: req.body.username
    });
    console.log(user);
    // Return an error if user does not exist.
    if (!user)
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!await user.comparePassword(req.body.password))
      return res.status(403).send({
        message: "username or password is wrong"
      });
      console.log(user._id);
    // set user session info
    req.session.userID = user._id;

    return res.send({
      user: user
    });

  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
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
