const express = require("express");
const router = express.Router();

// Require controller modules
const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const genre_controller = require("../controllers/genreController");
const bookinstance_controller = require("../controllers/bookinstanceController");

// BOOK ROUTES

// GET catalog home page
router.get("/", book_controller.index);
// CREATE
// GET request to create a Book. NOTE, this must come before that display Book (uses id)
router.get("/book/create", book_controller.book_create_get);
// POST request to create a Book
router.post("/book/create", book_controller.book_create_post);
// DELETE
// GET request to delete a Book
router.get("/book/:id/delete", book_controller.book_delete_get);
// POST request to delete a Book
router.post("/book/:id/delete", book_controller.book_delete_post);
// UPDATE
// GET request to update a Book
router.get("/book/:id/update", book_controller.book_update_get);
// POST request to update a Book
router.post("/book/:id/update", book_controller.book_update_post);
// GET ONE
// GET request for one Book
router.get("/book/:id", book_controller.book_detail);
// GET LIST
// GET request for list of all Book items
router.get("/books", book_controller.book_list);

// AUTHOR ROUTES
// CREATE
// GET request to create Author. NOTE this must come before route for id (i.e. display author)
router.get("/author/create", author_controller.author_create_get);
// POST request to create Author.
router.post("/author/create", author_controller.author_create_post);
// DELETE
// GET request to delete Author
router.get("/author/:id/delete", author_controller.author_delete_get);
// POST request to delete Author
router.post("/author/:id/delete", author_controller.author_delete_post);
// UPDATE
// GET request to update Author
router.get("/author/:id/update", author_controller.author_update_get);
// POST request to update Author
router.post("/author/:id/update", author_controller.author_update_post);
// GET ONE AUTHOR
// GET request for one Author
router.get("/author/:id", author_controller.author_detail);
// GET LIST
// GET request for list of all Authors
router.get("/authors", author_controller.author_list);

// GENRE ROUTES
// CREATE
// GET request to create a Genre. NOTE this must come before route that displays Genre (uses id)
router.get("/genre/create", genre_controller.genre_create_get);
// POST request to create a Genre
router.post("/genre/create", genre_controller.genre_create_post);
// DELETE
// GET request to delete a Genre
router.get("/genre/:id/delete", genre_controller.genre_delete_get);
// POST request to delete a Genre
router.post("/genre/:id/delete", genre_controller.genre_delete_post);
// UPDATE
// GET request to update a Genre
router.get("/genre/:id/update", genre_controller.genre_update_get);
// POST request to update a Genre
router.post("/genre/:id/update", genre_controller.genre_update_post);
// GET ONE GENRE
// GET request for one Genre
router.get("/genre/:id", genre_controller.genre_detail);
// GET LIST
// GET request for list of all Genres
router.get("/genres", genre_controller.genre_list);

// BOOKINSTANCE ROUTES
// CREATE
// GET request to create BookInstance. NOTE this must come before route that displays BookInstance (uses id)
router.get("/bookinstance/create", bookinstance_controller.bookinstance_create_get);
// POST request to create BookInstance
router.post("/bookinstance/create", bookinstance_controller.bookinstance_create_post);
// DELETE
// GET request to delete BookInstance
router.get("/bookinstance/:id/delete", bookinstance_controller.bookinstance_delete_get);
// POST request to delete BookInstance
router.post("/bookinstance/:id/delete", bookinstance_controller.bookinstance_delete_post);
// UPDATE
// GET request to update BookInstance
router.get("/bookinstance/:id/update", bookinstance_controller.bookinstance_update_get);
// POST request to update BookInstance
router.post("/bookinstance/:id/update", bookinstance_controller.bookinstance_update_post);
// GET ONE BOOKINSTANCE
router.get("/bookinstance/:id", bookinstance_controller.bookinstance_detail);
// GET LIST
router.get("/bookinstances", bookinstance_controller.bookinstance_list);

// EXPORT
module.exports = router;