const Menu = require("../../models/menu");
const Banner = require("../../models/banner");
const Cart = require("../../models/cart");
function homeController() {
  return {
    async index(req, res) {
      if (!req.user) return res.render("customers/indexPage");
      else if (req.user.role === "customer") {
        await Cart.findOne({ customerId: req.user._id }).then((response) => {
          req.session.cart = response;
        });
        Menu.find().then((pizzas) => {
          Banner.find({ number: 1 }).then((banner) => {
            return res.render("home", { pizzas: pizzas, banner: banner[0] });
          });
        });
      } else {
        return res.redirect("admin/orders");
      }
    },

    menu(req, res) {
      Menu.find().then((pizzas) => {
        Banner.find({ number: 1 }).then((banner) => {
          return res.render("home", { pizzas: pizzas, banner: banner[0] });
        });
      });
    },
  };
}

module.exports = homeController;
