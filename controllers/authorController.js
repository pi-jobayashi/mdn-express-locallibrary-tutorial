const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");

// sanitization/validation for forms
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// const authorDebug = require("debug")("author");


// Display list of all authors
exports.author_list = function (req, res, next) {

  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      // Success! Go on, young lad, do that dang thang
      res.render("author_list", { title: "All Authors", author_list: list_authors });
    })
  // res.send("NOT IMPLEMENTED: Author list");
};

// Display detail page for a particular Author
exports.author_detail = function (req, res, next) {

  async.parallel({
    author: function (callback) {
      Author.findById(req.params.id)
        .exec(callback);
    },
    books_by_author: function (callback) {
      Book.find({ "author": req.params.id }, "title summary")
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.author == null) { // in no author found
      const err = new Error("No author found.");
      err.status = 404;
      return next(err);
    }
    // Success, render dat schnip
    res.render("author_detail", { title: "Author Detail", author: results.author, books_by_author: results.books_by_author });
  });
  // display author name, lifespan, books written
  // display url for each book
  // res.send("NOT IMPLEMENTED: Author detail" + req.params.id);
};

// Display Author create form on GET
exports.author_create_get = function (req, res) {
  res.render("author_form", { title: "Add a new Author" });
  // res.send("NOT IMPLEMENTED: Author create GET");
};
// Handle Author create on POST
// exports.author_create_post = function (req, res) {
exports.author_create_post = [
  // Validate form body fields
  body("first_name").isLength({ min: 1 }).trim().withMessage("Author's First Name is required.")
    .isAlphanumeric().withMessage("Even though you may be a character, please remove any non-alphanumeric characters form the First Name."),
  body("family_name").isLength({ min: 1 }).trim().withMessage("Author's Last Name is required.")
    .isAlphanumeric().withMessage("Even though you may be a character, please remove any non-alphanumeric characters form the Family Name."),
  body("date_of_birth", "Invalid date of birth").optional({ checkFalsy: true }).isISO8601(),
  body("date_of_death", "Invalid date of death").optional({ checkFalsy: true }).isISO8601(),

  // Sanitize form body fields
  sanitizeBody("first_name").escape(),
  sanitizeBody("family_name").escape(),
  sanitizeBody("date_of_birth").toDate(),
  sanitizeBody("date_of_death").toDate(),

  // Process req after validation & sanitization
  (req, res, next) => {
    // extract validation errors from the req
    const errors = validationResult(req);

    // If errors exist, render form again with error messages
    if (!errors.isEmpty()) {
      res.render("author_form", { title: "Create Author", author: req.body, errors: errors.array() });
      return;
    }
    // Else if no errors, create Author with the escaped & trimmed data
    // then render then redirect to the newly created Author page
    else {
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      author.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(author.url);
      });
    }

  }
  // res.send("NOT IMPLEMENTED: Author create POST");
]

// Display Author delete form on GET
exports.author_delete_get = function (req, res, next) {
  async.parallel({
    author: function (callback) {
      Author.findById(req.params.id).exec(callback);
    },
    authors_books: function (callback) {
      Book.find({ "author": req.params.id }).exec(callback);
    },
  }, function (err, results) {
    // return err via next middleware
    if (err) { return next(err); }
    // if no resutls are returned
    if (results.author == null) {
      res.redirect("/catalog/authors");
    }
    // success, so render the author delete form
    res.render("author_delete", {
      title: "Delete Author",
      author: results.author,
      author_books: results.authors_books
    });
  });
  // res.send("NOT IMPLEMENTED: Author delete GET");
};
// Handle Author delete on POST
exports.author_delete_post = function (req, res, next) {
  // Find author by id, and books associated by the author
  async.parallel({
    author: function (callback) {
      Author.findById(req.body.authorid).exec(callback);
    },
    authors_books: function (callback) {
      Book.find({ "author": req.body.authorid }).exec(callback);
    },
  }, function (err, results) {
    // if err, reutnr err via next middleware (Is this the right way to describe this?)
    if (err) { return next(err); }
    // The author has book(s), render the books in the author delete form again
    if (results.authors_books.length > 0) {
      res.render("author_delete", { title: "Delete Author", author: results.author, author_books: results.authors_books });
      return;
    }
    // Author has no books and is able to be deleted
    // findByIdAndRemove author and redirect to the authors list page
    else {
      Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
        if (err) { return next(err); }
        // Success with deleting this author by id, redirect to authors list page
        res.redirect("/catalog/authors");
      });
    }
  });
  // res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET
exports.author_update_get = function (req, res, next) {

  // authorDebug("author route go!");

  sanitizeBody("id").escape().trim();

  Author.findById(req.params.id, function (err, author) {
    if (err) {
      // authorDebug("update error: " + err);
      return next(err);
    }
    // On success
    res.render("author_form", { title: "Update Author", author: author });
  });

  // async.parallel({
  //   author: function (callback) {
  //     Author.findById(req.params.id).exec(callback);
  //   },
  //   // authors_books: function (callback) {
  //   //   Book.find({ "author": req.params.id }).exec(callback);
  //   // },
  // }, function (err, results) {
  //   if (err) { return next(err); }
  //   // if no results, redirect to authors list page
  //   if (results.author == null) {
  //     // res.redirect("/catalog/authors");
  //     var err = new Error("Author not found");
  //     err.status = 404;
  //     return next(err);
  //   }
  //   // success, render the author update form
  //   res.render("author_form", { title: "Update Author", author: results.author });
  // });
  // res.send("NOT IMPLEMENTED: Author update GET");
};
// Handle Author update on POST
// exports.author_update_post = function (req, res, next) {
exports.author_update_post = [
  // Validate update page form values
  body("first_name", "Please enter in a First Name").isLength({ min: 1 }).trim().withMessage("Author's First Name is required.").isAlphanumeric().withMessage("Even though you may be a character, please remove any non-alphanumeric characters form the First Name."),
  body("family_name", "Please enter a Last Name").isLength({ min: 1 }).trim().withMessage("Author's Last Name is required.")
    .isAlphanumeric().withMessage("Even though you may be a character, please remove any non-alphanumeric characters form the Family Name."),
  body("date_of_birth", "Invalid date of birth").optional({ checkFalsy: true }).isISO8601(),
  body("date_of_death", "Invalid date of death").optional({ checkFalsy: true }).isISO8601(),

  // Sanitize body values
  sanitizeBody("first_name").escape(),
  sanitizeBody("family_name").escape(),
  sanitizeBody("date_of_birth").toDate(),
  sanitizeBody("date_of_death").toDate(),

  // Process values and proeceed to render form
  (req, res, next) => {
    // Create new errors object
    const errors = validationResult(req);

    // crete new Author from update form values
    var author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id // This is required, otherwise a new _id will be assigned!
    })

    // if errors exist, find author by callback id and re render the author form w/ sanitized values and error messages
    if (!errors.isEmpty()) {
      async.parallel({
        author: function (callback) {
          Author.find(callback);
        },
      }, function (err, results) {
        if (err) { return next(err); }
        // then rerender form
        res.render("author_form", { title: "Update Author", author: results.author, errors: errors.array() });
      });
      return;
    }
    // if no errors, update and save the author with new field data
    else {
      Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
        if (err) { return next(err); }
        // success, redirect to authors list page
        res.redirect(theauthor.url);
      });
    }
  }
  // res.send("NOT IMPLEMENTED: Author update POST");
];
