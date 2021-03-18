const express = require("express");
const router = express.Router({ mergeParams: true });

const passport = require("passport");

const usersController = require("../controllers/users");


router.route("/register")
    .get(usersController.renderRegisterForm)
    .post(usersController.register)

router.route("/login")
    .get(usersController.renderLoginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), usersController.login)

router.route("/logout")
    .get(usersController.logout)


module.exports = router;