const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");

// sanitization/validation for forms
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all Genre
exports.genre_list = function (req, res, next) {
  Genre.find()
    .exec(function (err, list_genres) {
      if (err) { return next(err); }
      // Success! Genre-ate dat Genre List
      res.render("genre_list", { title: "All Genres", genre_list: list_genres });
    });
  // res.send("NOT IMPLEMENTED: List of Genre");
};

// Display detail page for a specific genre
exports.genre_detail = function (req, res, next) {
  // for each genre's url clicked, display all associated books with the genre
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id)
        .exec(callback);
    },
    books_in_genre: function (callback) {
      Book.find({ 'genre': req.params.id })
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // If no results in genre
    if (results.genre == null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // Success! Render those specific genre results
    res.render("genre_detail", { title: "Genre Detail", genre: results.genre, books_in_genre: results.books_in_genre });
  });
  // genre detail page should display genre name

  // genre detail page should display list of all books in the genre with links to each of the book's details page
  // res.send("NOT IMPLEMENTED: Genre detail" + req.params.id);
};

// Display Genre create form on GET
exports.genre_create_get = function (req, res) {
  res.render("genre_form", { title: "Create Genre" });
  // res.send("NOT IMPLEMENTED: Genre create GET");
};
// Handle Genre create on POST
// exports.genre_create_post = function (req, res) {
exports.genre_create_post = [

  // Validate the name field that is not empty
  body("name", "Please enter a new Genre.").isLength({ min: 1 }).trim(),
  // Sanitize the genre form name field
  sanitizeBody("name").escape(),
  // Process the req after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from request, if any
    const errors = validationResult(req);
    // Create a Genre object with the escapted and trimmed data
    const genre = new Genre({
      name: req.body.name
    })

    // There are errors, render form again with sanitized values/error messages
    if (!errors.isEmpty()) {
      res.render("genre_form", { title: "Create Genre", genre: genre, errors: errors.array() });
      return;
    }
    // Form data is valid
    else {
      // Check if Genre name already exists
      Genre.findOne({
        "name": req.body.name
      })
        .exec(function (err, found_genre) {
          // 
          if (err) {
            return next(err);
          }
          // If name already exists, redirect to the existing genre type page? (this could be improved?!)
          if (found_genre) {
            res.redirect(found_genre.url);
          }
          // Else create genre, save, and return success
          else {
            genre.save(function (err) {
              if (err) {
                return next(err);
              }
              res.redirect(genre.url);
            });
          }
        });
    }
  }

]
// res.send("NOT IMPLEMENTED: Genre create POST");

// Display Genre delete form on GET
exports.genre_delete_get = function (req, res, next) {
  // 1. check for any books associated with the genre before deleting
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genres_books: function (callback) {
      Book.find({ "genre": req.params.id }).exec(callback);
    },
  }, function (err, results) {
    // if err, return err via next middleware
    if (err) { return next(err); }
    // if results callback has no genre, redirect to genre list page
    if (results.genre == null) {
      res.redirect("/catalog/genres");
    }
    // Genre found, keep on functional progression (KOFP)
    else {
      res.render("genre_delete", { title: "Delete Genre", genre: results.genre, genre_books: results.genres_books });
    }
  });
  // res.send("NOT IMPLEMENTED: Genre delete GET");
};
// Handle Genre delete on POST
exports.genre_delete_post = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.body.genreid).exec(callback);
    },
    genres_books: function (callback) {
      Book.find({ "genre": req.body.genreid }).exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // if no results, render the genre delete form again with db objs
    if (results.genres_books.length > 0) {
      res.render("genre_delete", { title: "Delete Genre", genre: results.genre, genre_books: results.genres_books });
      return;
    }
    else {
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
        if (err) { return next(err); }
        // success, redirect to genre list page
        res.redirect("/catalog/genres");
      });
    }
    // success! move on to find genre by id and delete
  });
  // res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET
exports.genre_update_get = function (req, res, next) {
  // when genre.url+"/update" is clicked, present form to update the genre
  // the only field to update is genre.name
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    // Do I need to update the genre name in all books? I don't thinkg so. 
  }, function (err, results) {
    if (err) { return next(err); }
    // if no genres found, throw 404
    if (results.genre == null) {
      const err = new Error("No genres found. Please try again later. When? I don't know.");
      err.status = 404;
      return next(err);
    }
    // success, genre found, display update form
    res.render("genre_form", { title: "Update Genre", genre: results.genre });
  });
  // Need to update genre name for all associated books within the genre?

  // res.send("NOT IMPLEMENTED: Genre update GET");
};
// Handle Genre update on POST
// exports.genre_update_post = function (req, res, next) {
exports.genre_update_post = [
  // Need to validate the field values from the update form
  body("name", "Please enter a genre name").isLength({ min: 3 }).trim().withMessage("Genre name must be three chars or mores."),

  // Need to sanitize the values
  sanitizeBody("name").escape(),

  (req, res, next) => {
    // if no errors, need to find the genre by id and update, save and redirect to newly updated genre list page
    const errors = validationResult(req);

    // create new Genre from updated form values
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id // This is required to prevent modifiying the immutable field "_id"
    });

    if (!errors.isEmpty()) {
      async.parallel({
        genre: function (callback) {
          Genre.find(callback);
        }
      }, function (err, results) {
        if (err) { return next(err); }
        // if no errors, re render the form with these validated + sanitized errors
        res.render("genre_form", { title: "Update genre", genre: results.genre, errors: errors.array() });
      });
      return;
    }
    // else, no errors, find genre by id and update, then redirect to genre list page
    else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
        if (err) { return next(err); }
        // success, save and redirect to dis schiznip genre's schaznap page
        res.redirect(thegenre.url);
      });
    }
  }
  // res.send("NOT IMPLEMENTED: Genre update POST");
];