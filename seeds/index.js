const mongoose = require("mongoose");
const Burger = require('../models/burger');
const cities = require("./cities")
const { adjectives, names, descriptors, images } = require("./seedHelpers")
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

//connecting db
// mongoose.connect("mongodb://localhost:27017/burgertachi", {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// })
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database Connected");
});
////

const seedDB = async () => {
    await Burger.deleteMany({});
    console.log("STARTING TO SEED")
    for (let i = 0; i < 300; i++) {

        const randomLocation = cities[Math.floor(Math.random() * cities.length)];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomDesc = descriptors[Math.floor(Math.random() * descriptors.length)];
        const randomImage = images[Math.floor(Math.random() * images.length)];
        const randomImage2 = images[Math.floor(Math.random() * images.length)];
        const randomPrice = Math.floor(Math.random() * 20) + 3


        const burg = new Burger({
            author: "602a27830d84331fac31b430",
            title: `${randomAdjective} ${randomName}`,
            location: `${randomLocation.city}, ${randomLocation.state}`,
            description: `${randomDesc}`,
            images: [{
                url: `https://res.cloudinary.com/qehbr/image/upload/v1613288263/Burgertachi/${randomImage}.jpg`,
                filename: `Burgertachi/${randomImage}`
            },
            {
                url: `https://res.cloudinary.com/qehbr/image/upload/v1613288263/Burgertachi/${randomImage2}.jpg`,
                filename: `Burgertachi/${randomImage2}`
            }],
            price: randomPrice,
            geometry: {
                type: "Point",
                coordinates: [randomLocation.longitude, randomLocation.latitude]
            }
        })

        await burg.save();
        console.log(`BURGER ${i} CREATED`);
    }
    console.log(`ENDING OF SEED`);
}
seedDB();
// seedDB().then(() => {
//     db.close();
// })