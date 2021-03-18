if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const secret = process.env.SECRET;

//modules 
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoDBStore = require("connect-mongo")(session);

//my error class
const ExpressError = require("./utils/ExpressError");

//views
const burgertachiRoutes = require("./routes/burgertachi");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");

//models
const User = require("./models/user");


//connecting db
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
// mongoose.connect("mongodb://localhost:27017/burgertachi", {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database Connected");
});
////

//settings
const app = express();

//security
app.use(mongoSanitize());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/qehbr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//views
app.engine('ejs', ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));

//arguments in req.body
app.use(express.urlencoded({ extended: true }));

//directories
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

//session (must be before passport!)
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60
})
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
})
const sessionConfig = {
    store,
    name: "sn",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

//passport (must be after passport!)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

//views in separate files
app.use("/burgertachi", burgertachiRoutes);
app.use("/burgertachi/:id/reviews", reviewsRoutes);
app.use("/", usersRoutes);
////


//VIEWS:

//home
app.get("/", (req, res) => {
    res.render("home");
})

//all other
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})
////

//error handling
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = "Something went wrong!" }
    res.status(statusCode).render("error", { err });
})

//Server opening
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server opened on port ${port}`);
})
////

