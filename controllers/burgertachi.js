const Burger = require('../models/burger');
const catchAsync = require("../utils/catchAsync");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })



const { cloudinary } = require("../cloudinary");


//all burgers
module.exports.index = catchAsync(async (req, res) => {
    const burgers = await Burger.find({});
    res.render("burgertachi/index", { burgers });
})

//create burger
module.exports.renderNewForm = (req, res) => {
    res.render("burgertachi/new");
}
module.exports.createBurger = catchAsync(async (req, res, next) => {
    //validation
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    if (imgs.length > 5 || imgs.length < 0) {
        req.flash("error", "Burger cannot have more than 5 images!")
        return res.redirect(`/burgertachi`);
    }
    //creating
    const geoData = await geocoder.forwardGeocode({
        query: req.body.burger.location,
        limit: 1
    }).send()

    const newBurger = new Burger(req.body.burger);
    newBurger.geometry = geoData.body.features[0].geometry;
    newBurger.images = imgs
    newBurger.author = req.user._id;
    await newBurger.save();
    req.flash("success", "Sucessfully made a new Burger!")
    res.redirect(`/burgertachi/${newBurger._id}`);
})

//burger by id
module.exports.showBurger = catchAsync(async (req, res) => {
    const burger = await Burger.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!burger) {
        req.flash("error", "Burger not found!")
        return res.redirect("/burgertachi")
    }
    res.render("burgertachi/show", { burger });
})

//edit burger
module.exports.renderEditForm = catchAsync(async (req, res) => {
    const { id } = req.params;
    const burger = await Burger.findById(id);
    if (!burger) {
        req.flash("error", "Burger not found!")
        return res.redirect("/burgertachi")
    }
    res.render("burgertachi/edit", { burger });
})
module.exports.updateBurger = catchAsync(async (req, res) => {
    const { id } = req.params;

    const burger = await Burger.findById(id);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));

    const newImagesCount = imgs.length;
    const oldImagesCount = burger.images.length;
    let deletedImagesCount = 0;

    if (req.body.deleteImages) {
        deletedImagesCount = req.body.deleteImages.length
    }

    if (newImagesCount + oldImagesCount - deletedImagesCount <= 5) {
        burger.images.push(...imgs)
        await burger.save();
    }
    else {
        req.flash("error", "Burger cannot have more than 5 images!");
        return res.redirect(`/burgertachi/${burger._id}`)
    }

    if (req.body.deleteImages) {
        if (newImagesCount + oldImagesCount - deletedImagesCount > 0) {
            for (let filename of req.body.deleteImages) {
                cloudinary.uploader.destroy(filename);
            }
            await burger.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        }
        else {
            req.flash("error", "Burger must have at least 1 image!");
            return res.redirect(`/burgertachi/${burger._id}`)
        }
    }

    await Burger.findByIdAndUpdate(id, { ...req.body.burger });


    const geoData = await geocoder.forwardGeocode({
        query: req.body.burger.location,
        limit: 1
    }).send()

    burger.geometry = geoData.body.features[0].geometry;
    burger.save();

    req.flash("success", "Sucessfully updated a burger!")
    res.redirect(`/burgertachi/${burger._id}`)
})

//delete burger 
module.exports.deleteBurger = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Burger.findByIdAndDelete(id);
    req.flash("success", "Sucessfully deleted burger!")
    res.redirect(`/burgertachi`)
})