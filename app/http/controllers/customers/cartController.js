function cartController() {
  return {
    index(req, res) {
      res.render("customers/cart");
    },
    update(req, res) {
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }
      let cart = req.session.cart;

      // Check if item does not exist in cart
      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body,
          qty: 1,
        };
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      } else {
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      }

      return res.json({ totalQty: req.session.cart.totalQty });
    },
    delete(req, res) {
      req.session.cart = {
        items: {},
        totalQty: 0,
        totalPrice: 0,
      };

      res.render("customers/cart");
    },
    minusitem(req, res) {
      let cart = req.session.cart;
      console.log(cart.items);

      cart.items[req.body.pizza].qty = cart.items[req.body.pizza].qty - 1;
      if (cart.items[req.body.pizza].qty <= 0) {
        delete cart.items[req.body.pizza];
      }
      if (cart.totalQty > 0) {
        cart.totalQty = cart.totalQty - 1;
      }

      cart.totalPrice = cart.totalPrice - req.body.price;

      return res.render("customers/cart");
    },
    plusitem(req, res) {
      let cart = req.session.cart;
      console.log(cart.items);

      cart.items[req.body.pizza].qty = cart.items[req.body.pizza].qty + 1;
      cart.totalQty = cart.totalQty + 1;
      cart.totalPrice = cart.totalPrice + parseInt(req.body.price);

      return res.render("customers/cart");
    },
  };
}

module.exports = cartController;
