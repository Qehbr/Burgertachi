const User = require('../models/user');

const catchAsync = require("../utils/catchAsync");

//register
module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
}
module.exports.register = catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) { return next(err); }
            req.flash("success", "Welcome to Burgertachi!");
            res.redirect("/burgertachi");
        });
    }
    catch (e) {
        if (e.name === 'MongoError' && e.code === 11000 && e.keyValue.email) {
            req.flash("error", 'Email address was already taken, please choose a different one.');
        }
        else {
            req.flash("error", e.message);
        }
        res.redirect("/register");
    }
})

//login
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}
module.exports.login = (req, res) => {
    req.flash("success", "Welcome Back!");
    const redirectUrl = req.session.returnTo || "/burgertachi";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//logout
module.exports.logout = (req, res) => {
    if (req.user) {
        req.flash("success", "Goodbye!");
        req.logout();
    }
    res.redirect("/burgertachi");
}