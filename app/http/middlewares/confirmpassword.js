function confirmpassword(req, res, next) {
  if (req.body.password === req.body.confirmpassword) {
    return next();
  }
  req.flash("error", "Passwords do not match");
  return res.redirect("/register");
}

module.exports = confirmpassword;
