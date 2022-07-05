const Order = require("../../../models/order");
const User = require("../../../models/user");
const Menu = require("../../../models/menu");
const Offer = require("../../../models/offers");
const { Namespace } = require("socket.io");

function dataController() {
  return {
    showCustomers(req, res) {
      User.find().then((users) => {
        return res.render("admin/customers", { users: users });
      });
    },

    menuItemsPage(req, res) {
      Menu.find().then((pizzas) => {
        return res.render("admin/menuitems", { pizzas: pizzas });
      });
    },

    addItemsPage(req, res) {
      res.render("admin/additems");
    },

    async addItem(req, res) {
      const { name, price, category, discount } = req.body;

      // Validate request
      if (!name || !price || !category || !discount) {
        req.flash("error", "All fields are required");
        return res.redirect("/admin/additem");
      }

      const discountRegexExp = /^[0-9]\d{1}$/gi;
      const validdiscount = discountRegexExp.test(discount);
      if (!validdiscount) {
        req.flash("error", "Discount Not valid");
        console.log("Invalid discount");
        return res.redirect("/admin/additem");
      }

      // Check if item already exists
      await Menu.exists({ name: name }, (err, result) => {
        if (result) {
          req.flash("error", "Item already exists");
          return res.redirect("/admin/additem");
        }
      });

      // Create new item
      const menuitem = new Menu({
        name,
        price,
        category,
        discount,
        image: req.file.filename,
      });

      menuitem
        .save()
        .then(() => {
          res.redirect("/admin/menuitems");
        })
        .catch((err) => {
          req.flash("error", " Error adding item: " + err.message);
          return res.redirect("/admin/additem");
        });
    },

    reports(req, res) {
      Order.find().then((orders) => {
        console.log(orders);
        return res.render("admin/report", { orders: orders });
      });
    },

    deleteItem(req, res) {
      const { name, price, category, discount, image } = req.body;
      // console.log(name, price, category, discount, image);

      // Delete item
      Menu.findOneAndUpdate(
        { name: name },
        {
          name,
          image,
          price,
          category,
          discount,
          isDeleted: true,
        }
      ).then((response) => {
        console.log(response);
        Menu.findOne({ name: req.body.name }).then((pizza) => {
          return res.render("admin/edititems", { pizza: pizza });
        });
      });

      // Menu.findOneAndDelete({ name: req.body.pizza }, function (err) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     return res.redirect("/admin/menuitems");
      //   }
      // });
    },

    restoreItem(req, res) {
      const { name, price, category, discount, image } = req.body;

      // Restore item
      Menu.findOneAndUpdate(
        { name: name },
        {
          name,
          image,
          price,
          category,
          discount,
          isDeleted: false,
        }
      ).then((response) => {
        console.log(response);
        Menu.findOne({ name: req.body.name }).then((pizza) => {
          return res.render("admin/edititems", { pizza: pizza });
        });
      });
    },

    editItemPage(req, res) {
      // console.log(req.body);
      Menu.findOne({ name: req.body.pizza }).then((pizza) => {
        // console.log(pizza);
        return res.render("admin/edititems", { pizza: pizza });
      });
    },

    async updateitem(req, res) {
      const { name, price, category, discount } = req.body;
      //   console.log(req.body);

      // Validate request
      if (!name || !price || !category || !discount || !req.file) {
        req.flash("error", "All fields are required");
        return res.redirect("/admin/additem");
      }

      const discountRegexExp = /^[0-9]\d{1}$/gi;
      const validdiscount = discountRegexExp.test(discount);
      if (!validdiscount) {
        req.flash("error", "Discount Not valid");
        console.log("Invalid discount");
        return res.redirect("/admin/additem");
      }

      // Update item
      Menu.findOneAndUpdate(
        { name: name },
        {
          name,
          image: req.file.filename,
          price,
          category,
          discount,
        }
      ).then((response) => {
        console.log("Success");
        return res.redirect("/admin/menuitems");
      });
    },

    addofferPage(req, res) {
      return res.render("admin/addoffer");
    },

    async addoffer(req, res) {
      let { code, discount } = req.body;
      code = code.toUpperCase();
      //     console.log(req.body);

      // Validate request
      if (!code || !discount) {
        req.flash("error", "All fields are required");
        return res.redirect("/admin/addoffer");
      }

      const discountRegexExp = /^[0-9]\d{1}$/gi;
      const validdiscount = discountRegexExp.test(discount);
      if (!validdiscount) {
        req.flash("error", "Discount Not valid");
        console.log("Invalid discount");
        return res.redirect("/admin/addoffer");
      }

      // Check if code already exists
      await Offer.exists({ code: code }, (err, result) => {
        if (result) {
          req.flash("error", "Code already in use.");
          return res.redirect("/admin/addoffer");
        } else {
          // Create new item
          const offer = new Offer({
            code,
            discount,
          });

          offer
            .save()
            .then(() => {
              res.redirect("/admin/offers");
            })
            .catch((err) => {
              req.flash("error", " Error adding coupon code: " + err.message);
              return res.redirect("/admin/offers");
            });
        }
      });
    },

    removeoffer(req, res) {
      //console.log(req.body);
      Offer.findOneAndDelete({ code: req.body.code }, function (err) {
        if (err) {
          console.log(err);
        } else {
          return res.redirect("/admin/offers");
        }
      });
    },

    offersPage(req, res) {
      Offer.find().then((offers) => {
        return res.render("admin/offers", { Offers: offers });
      });
    },

    editofferpage(req, res) {
      Offer.findOne({ code: req.body.code }).then((offer) => {
        return res.render("admin/editoffer", { offer: offer });
      });
    },

    updateoffer(req, res) {
      let { code, discount } = req.body;
      code = code.toUpperCase();

      // Validate request
      if (!code || !discount) {
        req.flash("error", "All fields are required");
        return res.redirect("/admin/addoffer");
      }

      const discountRegexExp = /^[0-9]\d{1}$/gi;
      const validdiscount = discountRegexExp.test(discount);
      if (!validdiscount) {
        req.flash("error", "Discount Not valid");
        console.log("Invalid discount");
        return res.redirect("/admin/addoffer");
      }

      // Update offer
      Offer.findOneAndUpdate(
        { code: code },
        {
          code,
          discount,
        }
      ).then((response) => {
        console.log("Success");
        return res.redirect("/admin/offers");
      });
    },
  };
}

module.exports = dataController;
