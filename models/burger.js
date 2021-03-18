const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})


const opts = { toJSON: { virtuals: true } };
const BurgerSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        }
    },
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
}, opts)

BurgerSchema.post("findOneAndDelete", async function (deleted) {
    if (deleted) {
        await Review.deleteMany({
            _id: {
                $in: deleted.reviews
            }
        })
    }
})

BurgerSchema.virtual("properties.popUpMarkup").get(function () {
    return `<strong><a href="/burgertachi/${this._id}">${this.title}</a></strong>`;
})

module.exports = mongoose.model("Burger", BurgerSchema);