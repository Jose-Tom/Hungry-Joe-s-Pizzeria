require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events");

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

// Event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

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

// Disable Cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Assets
app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(expressLayout);

// Passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  // console.log(req.session.cart);
  res.locals.user = req.user;
  // console.log(req.user);
  next();
});

// SET VIEW ENGINE
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

// START SERVER
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  // Join
  socket.on("join", (orderId) => {
    socket.join(orderId);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
