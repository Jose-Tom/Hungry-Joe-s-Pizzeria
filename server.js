require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const url = process.env.MONGO_CONNECTION_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("connection established...");
  })
  .catch((err) => {
    console.log("connection error");
    console.log(err);
  });

// SESSION config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
      mongoUrl: process.env.MONGO_CONNECTION_URL,
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hour
  })
);

app.use(flash());

// Assets
app.use(express.static("public"));
app.use(express.json());
app.use(expressLayout);

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// SET VIEW ENGINE
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

// START SERVER
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`);
});
