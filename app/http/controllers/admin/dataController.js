const Order = require("../../../models/order");
const User = require("../../../models/user");
const Menu = require("../../../models/menu");

function dataController() {
  return {
    showCustomers() {},
    menuItemsPage(req, res) {
      Menu.find().then((pizzas) => {
        return res.render("admin/menuitems", { pizzas: pizzas });
      });
    },
    addItemsPage(req, res) {
      res.render("admin/additems");
    },
    async addItem(req, res) {
      const { name, price, category } = req.body;

      // Validate request
      if (!name || !price || !category) {
        req.flash("error", "All fields are required");
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
  };
}

module.exports = dataController;
