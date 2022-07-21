function blockedUser(req, res, next) {
  if (req.user.isBlocked === false) {
    return next();
  } else {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  }
}

module.exports = blockedUser;
