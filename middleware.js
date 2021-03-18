const ExpressError = require("./utils/ExpressError");
const { burgerValidationSchema, reviewValidationSchema } = require("./schemas");

const Burger = require('./models/burger');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be Signed In first!")
        return res.redirect("/login");
    }
    next();
}

//midleware to check if author is current user
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const burger = await Burger.findById(id);
    if (!burger.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/burgertachi/${id}`);
    }
    next();
}

//validation of burger
module.exports.validateBurger = (req, res, next) => {
    const { error } = burgerValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}


//validation of review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/burgertachi/${id}`);
    }
    next();
}
