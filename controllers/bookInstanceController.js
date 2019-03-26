const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

// form sanitization and validation
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all BookInstances
exports.bookinstance_list = function (req, res) {

  BookInstance.find()
    .populate("book")
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Success so render dat schnazz
      res.render("bookinstance_list", { title: "Book Inventory", bookinstance_list: list_bookinstances });
    });
  // res.send("NOT IMPLEMENTED: BookInstance list");
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function (req, res, next) {

  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, book_instance) {
      if (err) { return next(err); }
      // Success! Let's show dat info about this book instance
      res.render("bookinstance_detail", { title: "ID", book_instance: book_instance });
    })
  // res.send("NOT IMPLEMENTED: BookInstance detail" + req.params.id);
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function (req, res, next) {
  // Find all Books by title
  Book.find({}, "title")
    .exec(function (err, books) {
      if (err) {
        return next(err);
      }
      // If no error, render the Book Instance form
      res.render("bookinstance_form", { title: "Create Book Instance", book_list: books });
    });
  // res.send("NOT IMPLEMENTED: BookInstance create GET");
};
// Handle BookInstance create on POST
// exports.bookinstance_create_post = function (req, res, next) {
exports.bookinstance_create_post = [
  // Validate the Book Instance fields
  body("book", "Book must be specified").isLength({ min: 1 }).trim(),
  body("imprint", "Imprint must be specified").isLength({ min: 1 }).trim(),
  body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601(),

  // Sanitize form field entries
  sanitizeBody("book").escape(),
  sanitizeBody("imprint").escape(),
  sanitizeBody("status").trim().escape(),
  sanitizeBody("due_back").toDate(),

  // Process request after validation + sanitization
  (req, res, next) => {
    // Extract any errors from request
    const errors = validationResult(req);

    // Create a new Book Instance
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    // Check for errors, if errors, render form again with error messaging
    if (!errors.isEmpty()) {
      Book.find({}, "title")
        .exec(function (err, books) {
          if (err) {
            return next(err);
          }
          // Books found in db, render BookInstance form with errors
          res.render("bookinstance_form", { title: "Create BookInstance", book_list: books, selected_book: book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    // There are no form validation errors, redirect to the new BookInstance page
    else {
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(bookinstance.url);
      });
    }
  }
  // res.send("NOT IMPLEMENTEED: BookInstance create POST");
]

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function (req, res, next) {
  // Find bookinstance by id
  BookInstance.findById(req.params.id)
    .exec(function (err, book_instance) {
      // If errors, return errors with next middleware
      if (err) {
        return next(err);
      }
      // if no instances found, redirect to book instances list page
      if (book_instance == null) {
        res.redirect("/catalog/bookinstances");
      }
      // If no error, render the Book Instance form
      res.render("bookinstance_delete", { title: "Delete this Book Instance", book_instance: book_instance });
    });
  // res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function (req, res, next) {

  // BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
  //   // If error, return error via next middleware
  //   if (err) {
  //     return next(err);
  //   }
  //   // Success, redirect to book instance list page?
  //   res.redirect("/catalog/bookinstances");
  // })

  BookInstance.findOneAndDelete({ "_id": req.body.bookinstanceid }, function deleteBookInstance(err) {
    // If error, return error via next middleware
    if (err) {
      return next(err);
    }
    // Success, redirect to book instance list page?
    res.redirect("/catalog/bookinstances");
  });

  // res.send("NOT IMPLEMENTED: BookInstance delete POST");

};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};
// Handle BookInstance update on POST
exports.bookinstance_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
