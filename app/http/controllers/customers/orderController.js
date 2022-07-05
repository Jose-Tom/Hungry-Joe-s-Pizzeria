const Order = require("../../../models/order");
const Cart = require("../../../models/cart");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    store(req, res) {
      // Validate request
      const { phone, address, paymentType, stripeToken } = req.body;
      if (!phone || !address) {
        // req.flash("error", "All fields are required");
        //return res.redirect("/cart");
        return res.json({ message: "All fields are required" });
      }
      // console.log(req.session.cart);
      const order = new Order({
        customerId: req.user._id,
        totalPrice: req.session.cart.cartItems.totalPrice,
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
              //  req.flash("success", "Order placed successfully");

              // Stripe payment
              if (paymentType === "card") {
                stripe.charges
                  .create({
                    amount: req.session.cart.cartItems.totalPrice * 100,
                    currency: "usd",
                    source: stripeToken,
                    description: `Pizza order: ${placedOrder._id}`,
                  })
                  .then(async () => {
                    placedOrder.paymentStatus = true;
                    placedOrder.paymentType = paymentType;
                    placedOrder
                      .save()
                      .then(async (ord) => {
                        // Emit
                        const eventEmitter = req.app.get("eventEmitter");
                        eventEmitter.emit("orderPlaced", ord);
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
                        return res.json({
                          message:
                            "Payment successful, Order placed successfully",
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  })
                  .catch(async (err) => {
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
                    console.log(err);
                    return res.json({
                      message:
                        "OrderPlaced but payment failed, You can pay at delivery time",
                    });
                  });
              } else {
                // delete req.session.cart;
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
                return res.json({ message: "Order placed succesfully" });
              }
            }
          );
        })
        .catch((err) => {
          return res.status(500).json({ message: "Something went wrong" });
        });
    },

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
    // // Emit
    // const eventEmitter = req.app.get("eventEmitter");
    // eventEmitter.emit("orderPlaced", placedOrder);
    // // return res.redirect("/customer/orders");
    // return res.json({ message: "Order placed successfully" });
    //         }
    //       );
    //     })
    //     .catch((err) => {
    //       // req.flash("error", "Something went wrong");
    //       //  return res.redirect("/cart");
    //       return res.json({ message: "Error placing order" });
    //     });
    // },

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
