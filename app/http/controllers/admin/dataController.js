const Order = require("../../../models/order");
const User = require("../../../models/user");
const Menu = require("../../../models/menu");
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

    reports() {},

    deleteItem(req, res) {
      // Delete item
      Menu.findOneAndDelete({ name: req.body.pizza }, function (err) {
        if (err) {
          console.log(err);
        } else {
          return res.redirect("/admin/menuitems");
        }
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
      console.log(req.body);

      // // Validate request
      // if (!name || !price || !category || !discount) {
      //   req.flash("error", "All fields are required");
      //   return res.redirect("/admin/additem");
      // }

      // const discountRegexExp = /^[0-9]\d{1}$/gi;
      // const validdiscount = discountRegexExp.test(discount);
      // if (!validdiscount) {
      //   req.flash("error", "Discount Not valid");
      //   console.log("Invalid discount");
      //   return res.redirect("/admin/additem");
      // }

      // // Check if item already exists
      // await Menu.exists({ name: name }, (err, result) => {
      //   if (result) {
      //     req.flash("error", "Item already exists");
      //     return res.redirect("/admin/additem");
      //   }
      // });

      // // Create new item
      // const menuitem = new Menu({
      //   name,
      //   price,
      //   category,
      //   discount,
      //   image: req.file.filename,
      // });

      // menuitem
      //   .save()
      //   .then(() => {
      //     res.redirect("/admin/menuitems");
      //   })
      //   .catch((err) => {
      //     req.flash("error", " Error adding item: " + err.message);
      //     return res.redirect("/admin/additem");
      //   });

      // const { name, price, category, discount } = req.body;
      // console.log(req.body);
      // console.log(name, price, category, discount);

      // // Validate request
      // if (!name || !price || !category || !discount) {
      //   console.log("All fields are required");
      //   return res.redirect("/admin/menuitems");
      // }

      // const discountRegexExp = /^[0-9]\d{1}$/gi;
      // const validdiscount = discountRegexExp.test(discount);
      // if (!validdiscount) {
      //   console.log("Invalid discount");
      //   return res.redirect("/admin/menuitems");
      // }
      // // console.log(req.body);
      // // Update item
      // Menu.findOneAndUpdate(
      //   { name: name },
      //   {
      //     name,
      //     image: req.body.image,
      //     price,
      //     category,
      //     discount,
      //   }
      // ).then(async (err) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log("Success");
      //     return res.redirect("/admin/menuitems");
      //   }
      // });
    },
  };
}

module.exports = dataController;
