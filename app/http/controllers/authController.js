const User = require("../../models/user");
const Order = require("../../models/order");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { UserPage } = require("twilio/lib/rest/ipMessaging/v1/service/user");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function authController() {
  const _getRedirectUrl = (req) => {
    return req.user.role === "admin" ? "/admin/orders" : "/";
  };
  return {
    login(req, res) {
      res.render("auth/login");
    },

    otploginpage(req, res) {
      res.render("auth/otplogin", { number: req.session.register?.number });
    },

    otpverifypage(req, res) {
      res.render("auth/otploginVerify");
    },

    otploginsend(req, res) {
      if (req.body.number) {
        client.verify
          .services(process.env.TWILIO_SERVICE_ID)
          .verifications.create({
            to: `+91${req.body.number}`,
            channel: "sms",
          })
          .then((data) => {
            req.session.number = req.body.number;
            return res.redirect("/otploginverify");
          });
      } else {
        return res.render("auth/otplogin");
      }
    },

    otploginverify(req, res) {
      // console.log(req.body);
      client.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({
          to: `+91${req.session.register.number}`,
          code: req.body.otp,
        })
        .then(async (data) => {
          // Hash password
          const hashedPassword = await bcrypt.hash(
            req.session.register.password,
            10
          );

          // Create a user
          const user = new User({
            name: req.session.register.name,
            email: req.session.register.email,
            number: req.session.register.number,
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
              console.log(err);
              return res.redirect("/register");
            });
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", " Error creating user");
        });
    },

    async postLogin(req, res, next) {
      const { email, password } = req.body;
      let checkuser = null;
      // Validate request
      if (!email || !password) {
        req.flash("error", "All fields are required");
        return res.redirect("/login");
      }

      await passport.authenticate("local", async (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }

        await User.findOne({ email: email }).then(async (response) => {
          checkuser = response;
          if (checkuser && checkuser.isBlocked === true) {
            req.flash("error", "This account is temporarily blocked.");
            return res.redirect("/login");
          } else {
            await req.logIn(user, (err) => {
              if (err) {
                req.flash("error", info.message);
                return next(err);
              }
              return res.redirect(_getRedirectUrl(req));
            });
          }
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
      const numberRegexExp = /^[6-9]\d{9}$/gi;
      const validnumber = numberRegexExp.test(number);
      if (!validnumber) {
        req.flash("error", "Enter a valid number. (Indian)");
        req.flash("name", name);
        req.flash("number", number);
        req.flash("email", email);
        return res.redirect("/register");
      }

      const passwordRegexExp = /^.{6,}$/;
      const validpassword = passwordRegexExp.test(password);
      if (!validpassword) {
        req.flash("error", "Password should be minimum 6 characters.");
        req.flash("name", name);
        req.flash("number", number);
        req.flash("email", email);
        return res.redirect("/register");
      }

      const emailRegexExp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const validemail = emailRegexExp.test(email);
      if (!validemail) {
        req.flash("error", "Enter a valid email");
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

      req.session.register = {
        name: name,
        email: email,
        number: number,
        password: password,
      };

      return res.redirect("/otplogin");

      // // Hash password
      // const hashedPassword = await bcrypt.hash(password, 10);

      // // Create a user
      // const user = new User({
      //   name,
      //   email,
      //   number,
      //   password: hashedPassword,
      // });

      // user
      //   .save()
      //   .then((user) => {
      //     req.logIn(user, (err) => {
      //       if (err) {
      //         req.flash("error", info.message);
      //         return next(err);
      //       }
      //       return res.redirect("/");
      //     });
      //   })
      //   .catch((err) => {
      //     req.flash("error", " Error creating user");
      //     return res.redirect("/register");
      //   });
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
      const { name, email, number, password, confirmpassword, address } =
        req.body;

      // Validate request
      if (!name || !email || !number || !confirmpassword) {
        req.flash("error", "All fields are mandatory");
        req.flash("name", name);
        req.flash("number", number);
        req.flash("email", email);
        return res.redirect("/customer/profile");
      }

      if (password !== confirmpassword) {
        req.flash("error", "Passwords do not match");
        req.flash("name", name);
        req.flash("number", number);
        req.flash("email", email);
        return res.redirect("/customer/profile");
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
          address,
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

    async blockuser(req, res) {
      let usertoblock;
      // console.log(req.body);
      await User.findOne({ email: req.body.user.email }).then((response) => {
        usertoblock = response;
        if (usertoblock) {
          // console.log(usertoblock);
          usertoblock.isBlocked = true;
          usertoblock.save();
        }
      });
      return res.redirect("/admin/customers");
    },

    async unblockuser(req, res) {
      let usertounblock;
      // console.log(req.body);
      await User.findOne({ email: req.body.user.email }).then((response) => {
        usertounblock = response;
      });
      if (usertounblock) {
        // console.log(usertoblock);
        usertounblock.isBlocked = false;
        usertounblock.save();
      }

      return res.redirect("/admin/customers");
    },

    async removeuser(req, res) {
      // Delete Orders By User
      Order.deleteMany({ customerId: req.body.user.id })
        .then(function () {
          console.log("Data deleted"); // Success
        })
        .catch(function (error) {
          console.log(error); // Failure
        });

      // Delete user
      User.findOneAndDelete({ email: req.body.user.email }, function (err) {
        if (err) {
          console.log(err);
        } else {
          return res.redirect("/admin/customers");
        }
      });
    },
  };
}

module.exports = authController;
