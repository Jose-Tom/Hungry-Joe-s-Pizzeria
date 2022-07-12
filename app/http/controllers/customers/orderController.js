const Order = require("../../../models/order");
const Cart = require("../../../models/cart");
const moment = require("moment");
const axios = require("axios");

function orderController() {
  return {
    checkoutPage(req, res) {
      return res.render("customers/checkout");
    },

    store(req, res) {
      // Validate request
      const { phone, address, paymentType } = req.body;
      if (!phone || !address) {
        // req.flash("error", "All fields are required");
        //return res.redirect("/cart");
        return res.json({ message: "All fields are required" });
      }
      // req.session.cart.cartItems.totalPrice =
      //   req.session.cart.cartItems.totalPrice -
      //   (req.session.cart.cartItems.totalPrice * req.session.coupondiscount) /
      //     100;
      // console.log(req.session.cart);
      // Card payment
      let totalPrice = req.session.cart.cartItems.totalPrice;
      const coupondiscount = req.session.coupondiscount
        ? req.session.coupondiscount
        : 0;
      totalPrice = totalPrice - (totalPrice * coupondiscount) / 100;

      if (paymentType === "card") {
        // axios
        //   .get("/get-razorpay-key")
        //   .then((res) => {
        //     console.log(res.body);
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //   });
        // axios
        //   .post("/create-order", {
        //     amount: req.session.cart.cartItems.totalPrice,
        //   })
        //   .then((res) => {
        //     console.log(res);
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //   });
        // axios
        //   .post("/pay-order", {
        //     amount: req.session.cart.cartItems.totalPrice,
        //   })
        //   .then((res) => {
        //     console.log(res);
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //   });

        const order = {
          customerId: req.user._id,
          totalPrice,
          items: req.session.cart?.cartItems.items,
          paymentType,
          phone,
          address,
        };

        return res.render("customers/checkout", { order: order });

        // req.session.cart = {
        //   cartItems: {
        //     items: [
        //       {
        //         productId: "",
        //         name: "",
        //         category: "",
        //         image: "",
        //         price: 0,
        //         qty: 0,
        //         discount: 0,
        //       },
        //     ],
        //     totalPrice: 0,
        //     totalQty: 0,
        //   },
        //   _id: "",
        //   customerId: "",
        //   deleted: true,
        // };
        // await Cart.deleteOne({ customerId: req.user._id });
        // return res.json({ message: "Order placed succesfully" });
      }

      const order = new Order({
        customerId: req.user._id,
        totalPrice,
        items: req.session.cart?.cartItems.items,
        paymentType,
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
                      discount: 0,
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
              return res.redirect("/customer/orders");
            }
          );
        })
        .catch((err) => {
          return res.status(500).json({ message: "Something went wrong" });
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
