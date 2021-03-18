const express = require("express");
const router = express.Router();

const { isLoggedIn, isAuthor, validateBurger } = require("../middleware");

const burgertachiController = require("../controllers/burgertachi");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });


router.route("/")
    .get(burgertachiController.index)
    .post(isLoggedIn, upload.array("image"), validateBurger, burgertachiController.createBurger) //TODO

router.route("/new")
    .get(isLoggedIn, burgertachiController.renderNewForm)

router.route("/:id")
    .get(burgertachiController.showBurger)
    .put(isLoggedIn, isAuthor, upload.array("image"), validateBurger, burgertachiController.updateBurger)
    .delete(isLoggedIn, isAuthor, burgertachiController.deleteBurger)

router.route("/:id/edit")
    .get(isLoggedIn, isAuthor, burgertachiController.renderEditForm)

module.exports = router;