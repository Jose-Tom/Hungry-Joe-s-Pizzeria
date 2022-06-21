const User = require("../../models/user");
const Order = require("../../models/order");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
  const _getRedirectUrl = (req) => {
    return req.user.role === "admin" ? "/admin/orders" : "/";
  };
  return {
    login(req, res) {
      res.render("auth/login");
    },
    postLogin(req, res, next) {
      const { email, password } = req.body;
      // Validate request
      if (!email || !password) {
        req.flash("error", "All fields are required");
        return res.redirect("/login");
      }
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        req.logIn(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }
          return res.redirect(_getRedirectUrl(req));
        });
      })(req, res, next);
    },

    register(req, res) {
      res.render("auth/register");
    },

    async postRegister(req, res) {
      const { name, email, number, password } = req.body;

      // Validate request
      if (!name || !email || !number || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("number", number);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // Check if email exists
      await User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash("error", "Email already taken");
          req.flash("name", name);
          req.flash("number", number);
          req.flash("email", email);
          //    return res.redirect("/register");
        }
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a user
      const user = new User({
        name,
        email,
        number,
        password: hashedPassword,
      });

      user
        .save()
        .then((user) => {
          req.logIn(user, (err) => {
            if (err) {
              req.flash("error", info.message);
              return next(err);
            }
            return res.redirect("/");
          });
        })
        .catch((err) => {
          req.flash("error", " Error creating user");
          return res.redirect("/register");
        });
    },

    logout(req, res) {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    },

    profile(req, res) {
      res.render("customers/profile");
    },

    async update(req, res) {
      const { name, email, number, password } = req.body;

      // Validate request
      if (!name || !email || !number) {
        req.flash("error", "All fields except password are mandatory");
        req.flash("name", name);
        req.flash("number", number);
        req.flash("email", email);
        return res.redirect("/user/update");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user
      User.findOneAndUpdate(
        { email: req.body.email },
        {
          name: name,
          password: hashedPassword,
          email,
          number,
        }
      ).exec(function (err, user) {
        if (err) {
          req.flash("error", "Something went wrong");
          res.redirect("/user/update");
        }
        return res.redirect("/");
      });
    },

    delete(req, res) {
      // Delete Orders By User
      Order.deleteMany({ customerId: req.body.id })
        .then(function () {
          console.log("Data deleted"); // Success
        })
        .catch(function (error) {
          console.log(error); // Failure
        });

      // Delete user
      User.findOneAndDelete({ email: req.body.email }, function (err) {
        if (err) {
          console.log(err);
        } else {
          return res.redirect("/");
        }
      });
    },
  };
}

module.exports = authController;
