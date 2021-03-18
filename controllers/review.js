const Burger = require('../models/burger');
const Review = require('../models/review')

const catchAsync = require("../utils/catchAsync");

//create review
module.exports.createReview = catchAsync(async (req, res) => {
    const burger = await Burger.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    burger.reviews.push(review);
    await review.save();
    await burger.save();
    req.flash("success", "Created a new review!")
    res.redirect(`/burgertachi/${burger._id}`)
})

//delete review
module.exports.deleteReview = catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Burger.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Sucessfully deleted review!")
    res.redirect(`/burgertachi/${id}`);
})