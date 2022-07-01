const Menu = require("../../models/menu");
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
          return res.render("home", { pizzas: pizzas });
        });
      } else {
        return res.redirect("admin/orders");
      }
    },
    menu(req, res) {
      Menu.find().then((pizzas) => {
        return res.render("home", { pizzas: pizzas });
      });
    },
  };
}

module.exports = homeController;
