const express = require("express");
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const reviewController = require("../controllers/review");


router.route("/")
    .post(isLoggedIn, validateReview, reviewController.createReview)

router.route("/:reviewId")
    .delete(isLoggedIn, isReviewAuthor, reviewController.deleteReview)

    
module.exports = router;