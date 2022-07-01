const Order = require("../../../models/order");
const Cart = require("../../../models/cart");
const moment = require("moment");
function orderController() {
  return {
    store(req, res) {
      // Validate request
      const { phone, address } = req.body;
      if (!phone || !address) {
        req.flash("error", "All fields are required");
        return res.redirect("/cart");
      }

      const order = new Order({
        customerId: req.user._id,
        totalPrice: req.session.cart.cartItems.totalPrice,
        items: req.session.cart?.cartItems.items,
        phone,
        address,
      });
      order
        .save()
        .then((result) => {
          Order.populate(
            result,
            { path: "customerId" },
            async (err, placedOrder) => {
              req.flash("success", "Order placed successfully");
              req.session.cart = {
                cartItems: {
                  items: [
                    {
                      productId: "",
                      name: "",
                      category: "",
                      image: "",
                      price: 0,
                      qty: 0,
                    },
                  ],
                  totalPrice: 0,
                  totalQty: 0,
                },
                _id: "",
                customerId: "",
                deleted: true,
              };
              await Cart.deleteOne({ customerId: req.user._id });
              // Emit
              const eventEmitter = req.app.get("eventEmitter");
              eventEmitter.emit("orderPlaced", placedOrder);
              return res.redirect("/customer/orders");
            }
          );
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/cart");
        });
    },

    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      res.render("customers/orders", { orders: orders, moment: moment });
    },
    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // Authorize user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order });
      }
      return res.redirect("/");
    },
  };
}

module.exports = orderController;
