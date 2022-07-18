const Order = require("../../../models/order");
const Cart = require("../../../models/cart");
const moment = require("moment");
const paypal = require("paypal-rest-sdk");

function orderController() {
  return {
    checkoutPage(req, res) {
      return res.render("customers/checkout");
    },

    store(req, res) {
      // Validate request
      const { phone, address, paymentType } = req.body;
      if (!phone || !address) {
        req.flash("error", "All fields are required");
        return res.redirect("/cart");
      }

      let totalPrice = req.session.cart.cartItems.totalPrice;
      const coupondiscount = req.session.coupondiscount
        ? req.session.coupondiscount
        : 0;
      totalPrice = totalPrice - (totalPrice * coupondiscount) / 100;

      if (paymentType === "card" || paymentType === "paypal") {
        const order = {
          customerId: req.user._id,
          totalPrice,
          items: req.session.cart?.cartItems.items,
          paymentType,
          phone,
          address,
        };

        return res.render("customers/checkout", { order: order });
      } else {
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
      }
    },

    async index(req, res) {
      // console.log(req.user);
      if (req.query.PayerID) {
        let price = req.session.cart.cartItems.totalPrice / 100;
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
          payer_id: payerId,
          transactions: [
            {
              amount: {
                currency: "USD",
                total: price,
              },
            },
          ],
        };

        paypal.payment.execute(
          paymentId,
          execute_payment_json,
          function (error, payment) {
            if (error) {
              console.log(error.response);
            } else {
              //console.log(JSON.stringify(payment));
              let totalPrice = req.session.cart.cartItems.totalPrice / 100;
              let items = req.session.cart.cartItems.items;

              const order = new Order({
                customerId: req.user._id,
                totalPrice,
                items,
                paymentType: "paypal",
                phone: req.user.number,
                address: req.user.address,
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
                    }
                  );
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          }
        );
      }
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
