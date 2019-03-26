const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const async = require("async");


// form validation/sanitization
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// using debug instead of console.log to minimize logggin in production
var bookControllerDebug = require("debug")("bookController");

// Display site home page
exports.index = function (req, res) {

  async.parallel({
    book_count: function (callback) {
      Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
    },
    book_instance_count: function (callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: function (callback) {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    author_count: function (callback) {
      Author.countDocuments({}, callback);
    },
    genre_count: function (callback) {
      Genre.countDocuments({}, callback);
    }
  }, function (err, results) {
    res.render("index", { title: "Local Library", error: err, data: results });
  });
  // res.send("NOT IMPLEMENTED: Site Home Page");
};

// Display list of all Books
exports.book_list = function (req, res, next) {

  Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      // Successful so render dat schnip!
      res.render("book_list", { title: "Book List", book_list: list_books });
    });
  // res.send("NOT IMPLEMENTED: Book list");
};

// Display detail page for a specific Book
exports.book_detail = function (req, res, next) {

  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id)
        .populate("author")
        .populate("genre")
        .exec(callback);
    },
    book_instance: function (callback) {
      BookInstance.find({ "book": req.params.id })
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // If no books found, return error
    if (results.book == null) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    // Success, show the book detail page
    res.render("book_detail", { title: "Title", book: results.book, book_instance: results.book_instance });
  });
  // res.send("NOT IMPLEMENTED: Book detial" + req.params.id);
};

// Display Book create form on GET
exports.book_create_get = function (req, res, next) {
  // Get all Authors and Genres, which we can use for adding to our Book
  async.parallel({
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    res.render("book_form", { title: "Create Book", authors: results.authors, genres: results.genres });
  });
  // res.send("NOT IMPLEMENTED: Book create GET");
};
// Handle Book create on POST
// exports.book_create_post = function (req, res, next) {
exports.book_create_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      }
      else {
        req.body.genre = new Array(req.body.genre);
      }
      next();
    }
  },

  // Validate the fields
  body("title", "Title must not be empty").isLength({ min: 1 }).trim(),
  body("author", "Please select an author").isLength({ min: 1 }).trim(),
  body("summary", "Don't forget to add a summary!").isLength({ min: 1 }).trim(),
  body("isbn", "Please enter an ISBN").isLength({ min: 1 }).trim(),

  // Sanitize form field data using wildcard *
  sanitizeBody("*").escape(),

  // Process the request after validation & sanitization
  (req, res, next) => {
    // Extract errors from the request
    const errors = validationResult(req);

    // Create new Book with escaped and trimmed data
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });

    // There are errors
    if (!errors.isEmpty()) {
      // Rerender the form with sanitized error messages
      // Get all Authors and Genres for form
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) {
          return next(err);
        }
        // Mark our selected Genres as checked
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = "true";
          }
        }
        res.render("book_form", { title: "Create Book", authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });

      return;

    }
    // Data is valid, save book and redirect to the newly created book's page/URL
    else {
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        bookControllerDebug("Book has been created!");
        res.redirect(book.url);
      });
    }

  }
  // res.send("NOT IMPLEMENTED: Book create POST");
];

// Display Book delete form on GET
exports.book_delete_get = function (req, res, next) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).exec(callback);
    },
    books_instances: function (callback) {
      BookInstance.find({ "book": req.params.id }).exec(callback);
    },
  }, function (err, results) {
    // if err, return the error
    if (err) { return next(err); }
    // if no results, redirect to book list page
    if (results.book == null) {
      res.redirect("/catalog/books");
    }
    // Success, so render the delete book form
    res.render("book_delete", {
      title: "Title",
      book: results.book,
      book_instances: results.books_instances
    });
  });
  // res.send("NOT IMPLEMENTED: Book delete GET");
};
// Handle Book delete on POST
exports.book_delete_post = function (req, res, next) {
  // Find book by it's id and any instances of book
  async.parallel({
    book: function (callback) {
      Book.findById(req.body.bookid).exec(callback);
    },
    books_instances: function (callback) {
      BookInstance.find({ "book": req.body.bookid }).exec(callback);
    },
  }, function (err, results) {
    // If err, return err via next middleware funky
    if (err) {
      // console.log("Book has instances!");
      bookControllerDebug("Book has instances!");
      return next(err);
    }
    // The book has instance(s), render the instances in the book delete page again
    if (results.books_instances.length > 0) {
      // console.log("Book has instances!");
      bookControllerDebug("Book has instances!");
      res.render("book_delete", { title: "Title", book: results.book, book_instances: results.books_instances });
      return;
    }
    // Success, no instances, find book by id and remove
    else {
      // console.log("Book is deleted!");
      bookControllerDebug("Book is deleted!");
      Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
        if (err) { return next(err); }
        // Seccess, redirect to book list page
        res.redirect("/catalog/books");
      });
    }
  });
  // res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display Book update form on GET
exports.book_update_get = function (req, res, next) {
  // Get book, author, and genre for the update form
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).populate("author").populate("genre").exec(callback);
    },
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // if book is not found return a 404
    if (results.book == null) {
      var err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    // success, render all our selected genres as checked
    for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
      for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        if (results.genres[all_g_iter]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
          results.genres[all_g_iter].checked = "true";
        }
      }
    }
    res.render("book_form", { title: "Update Book", authors: results.authors, genres: results.genres, book: results.book });
  });
  // res.send("NOT IMPLEMENTED: Book update GET");
};
// Handle Book update on POST
// exports.book_update_post = function (req, res, next) {
exports.book_update_post = [
  // Convert the genre to an Array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      }
      else {
        req.body.genre = new Array(req.body.genre);
      }
      next();
    }
  },

  // Validate fields
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("author", "Please select an author.").isLength({ min: 1 }).trim(),
  body("summary", "Don't forget to tell us a bit about this book!").isLength({ min: 1 }).trim(),
  body("isbn", "ISBN number: required. I am a robot.").isLength({ min: 1 }).trim(),

  // Sanitize fields
  sanitizeBody("title").escape(),
  sanitizeBody("author").escape(),
  sanitizeBody("summary").escape(),
  sanitizeBody("isbn").escape(),
  sanitizeBody("genre.*").escape(),

  // Process request after validation + sanitization
  (req, res, next) => {
    // EXtract validation errors from req
    const errors = validationResult(req);

    // Create new Book obj with escaped/trimmed data and old id
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: (typeof req.body.genre === "undefined") ? [] : req.body.genre,
      _id: req.params.id // This is required, otherwise a new _id will be assigned!
    });

    // Check for errors. if errors, render form again w/ sanitized values & error messages
    if (!errors.isEmpty()) {
      // Get all authors and genres for form
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) { return next(err); }
        // success, mark our genres as selected and render form
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = "true";
          }
        }
        res.render("book_form", { title: "Update Book", authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    }
    // Data is valid and error-free! Find Book by Id and Update, save updates
    else {
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        // Book.findOneAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) { return next(err); }
        // success, redirect to the book detail page
        res.redirect(thebook.url);
      });
    }
  }
  // res.send("NOT IMPLEMENTED: Book update POST");
];