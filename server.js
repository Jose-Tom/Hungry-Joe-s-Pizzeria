const express = require("express");
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");

const app = express();
const PORT = process.env.PORT || 3000;

// Assets
app.use(express.static("public"));
app.use(expressLayout);

// SET VIEW ENGINE
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// ROUTES
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/cart", (req, res) => {
  res.render("customers/cart");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/register", (req, res) => {
  res.render("auth/register");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`);
});
