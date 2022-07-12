const { request } = require("express");
const { update } = require("../../../models/cart");
const Cart = require("../../../models/cart");
const Offers = require("../../../models/offers");

// function cartController() {
//   return {
//     index(req, res) {
//       res.render("customers/cart");
//     },

//     async update(req, res) {
//       if (!req.session.cart) {
//         req.session.cart = {
//           items: {},
//           totalQty: 0,
//           totalPrice: 0,
//         };
//       }
//       let cart = req.session.cart;
//       cartSync(cart);
//       // Check if item does not exist in cart
//       if (!cart.items[req.body._id]) {
//         cart.items[req.body._id] = {
//           item: req.body,
//           qty: 1,
//         };
//         cart.totalQty = cart.totalQty + 1;
//         cart.totalPrice = cart.totalPrice + req.body.price;
//       } else {
//         cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
//         cart.totalQty = cart.totalQty + 1;
//         cart.totalPrice = cart.totalPrice + req.body.price;
//       }
//       return res.json({ totalQty: req.session.cart.totalQty });
//       async function cartSync(sessionCart) {
//         await Cart.find({ customerId: req.session.passport.user }).then(
//           (response) => {
//             console.log(response);
//           }
//         );
//       }
//     },
//     delete(req, res) {
//       req.session.cart = {
//         items: {},
//         totalQty: 0,
//         totalPrice: 0,
//       };

//       res.render("customers/cart");
//     },
//     minusitem(req, res) {
//       let cart = req.session.cart;

//       cart.items[req.body.pizza].qty = cart.items[req.body.pizza].qty - 1;
//       if (cart.items[req.body.pizza].qty <= 0) {
//         delete cart.items[req.body.pizza];
//       }
//       if (cart.totalQty > 0) {
//         cart.totalQty = cart.totalQty - 1;
//       }

//       cart.totalPrice = cart.totalPrice - req.body.price;

//       return res.render("customers/cart");
//     },
//     plusitem(req, res) {
//       let cart = req.session.cart;

//       cart.items[req.body.pizza].qty = cart.items[req.body.pizza].qty + 1;
//       cart.totalQty = cart.totalQty + 1;
//       cart.totalPrice = cart.totalPrice + parseInt(req.body.price);

//       return res.render("customers/cart");
//     },
//   };
// }

function cartController() {
  return {
    index(req, res) {
      //    console.log(req.session);
      res.render("customers/cart");
    },

    async update(req, res) {
      // console.log(req.body);
      // console.log(req.user);
      if (!req.session.cart) {
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
          deleted: false,
        };
      }
      let cart = null;
      await Cart.findOne({ customerId: req.user._id }).then((response) => {
        cart = response;
      });
      if (cart) {
        //console.log(cart);
        //console.log(req.body);
        const itemToAdd = cart.cartItems.items.find((el) => {
          return el.productId.toString() === req.body._id.toString();
        });
        if (itemToAdd) {
          //  console.log(itemToAdd);
          cart.cartItems.items.map((obj) => {
            if (obj.productId === itemToAdd.productId) {
              obj.qty++;
              cart.cartItems.totalPrice +=
                obj.price - (obj.price * obj.discount) / 100;
              cart.cartItems.totalQty += 1;
            }
          });
          cart.save();
          req.session.cart = cart;
          //   console.log(req.session.cart);
          //  res.render("customers/cart");
        } else {
          cart.cartItems.items.push({
            productId: req.body._id,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price - (req.body.price * req.body.discount) / 100,
            image: req.body.image,
            discount: req.body.discount,
            qty: 1,
          });
          cart.cartItems.totalPrice +=
            req.body.price - (req.body.price * req.body.discount) / 100;
          cart.cartItems.totalQty += 1;
          cart.save();
          req.session.cart = cart;
          //   res.render("customers/cart");
        }
      } else {
        const newCart = new Cart({
          customerId: req.user._id,
          deleted: false,
          cartItems: {
            totalPrice:
              req.body.price - (req.body.price * req.body.discount) / 100,
            totalQty: 1,
            items: [
              {
                productId: req.body._id,
                name: req.body.name,
                price:
                  req.body.price - (req.body.price * req.body.discount) / 100,
                image: req.body.image,
                category: req.body.category,
                discount: req.body.discount,
                qty: 1,
              },
            ],
          },
        });
        newCart
          .save()
          .then((result) => {
            console.log(result);
            req.session.cart = newCart;
          })
          .catch((err) => {
            req.flash("error", "Something went wrong");
            console.log(err);
          });
      }
      return res.json({ totalQty: req.session.cart.cartItems.totalQty });
      // res.redirect("/");
    },

    async delete(req, res) {
      await Cart.deleteOne({ customerId: req.user._id });
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
      req.session.coupondiscount = null;
      req.session.couponcode = null;
      res.render("customers/cart");
    },

    async minusitem(req, res) {
      // console.log(req.body);
      // let cart = req.session.cart;

      // cart.items[req.body.pizza].qty = cart.items[req.body.pizza].qty - 1;
      // if (cart.items[req.body.pizza].qty <= 0) {
      //   delete cart.items[req.body.pizza];
      // }
      // if (cart.totalQty > 0) {
      //   cart.totalQty = cart.totalQty - 1;
      // }

      // cart.totalPrice = cart.totalPrice - req.body.price;

      // return res.render("customers/cart");
      let cart = null;
      await Cart.findOne({ customerId: req.user._id }).then((response) => {
        cart = response;
      });
      if (cart) {
        // console.log(cart);
        const itemToEdit = cart.cartItems.items.find((el) => {
          return el._id.toString() === req.body.pizza.toString();
        });
        if (itemToEdit) {
          // console.log(itemToEdit);
          cart.cartItems.items.map((obj) => {
            if (obj.productId === itemToEdit.productId) {
              if (obj.qty > 1) {
                obj.qty--;
              } else {
                cart.cartItems.items = cart.cartItems.items.filter(
                  (obj) => obj.productId !== itemToEdit.productId
                );
              }
              cart.cartItems.totalPrice -=
                obj.price - (obj.price * obj.discount) / 100;
              cart.cartItems.totalQty -= 1;
            }
          });
          cart.save();
          req.session.cart = cart;
          //  console.log(req.session.cart);
        }
        return res.render("customers/cart");
      }
    },

    async plusitem(req, res) {
      let cart = null;
      await Cart.findOne({ customerId: req.user._id }).then((response) => {
        cart = response;
      });
      if (cart) {
        // console.log(cart);
        const itemToEdit = cart.cartItems.items.find((el) => {
          return el._id.toString() === req.body.pizza.toString();
        });
        if (itemToEdit) {
          // console.log(itemToEdit);
          cart.cartItems.items.map((obj) => {
            if (obj.productId === itemToEdit.productId) {
              obj.qty++;
              cart.cartItems.totalPrice +=
                obj.price - (obj.price * obj.discount) / 100;
              cart.cartItems.totalQty += 1;
            }
          });
          cart.save();
          req.session.cart = cart;
          // console.log(req.session.cart.cartItems.items);
        }
        return res.render("customers/cart");
      }
      // let cart = req.session.cart;

      // cart.items[req.body.pizza].qty = cart.items[req.body.pizza].qty + 1;
      // cart.totalQty = cart.totalQty + 1;
      // cart.totalPrice = cart.totalPrice + parseInt(req.body.price);

      // return res.render("customers/cart");
    },

    async couponApply(req, res) {
      const code = req.body.code.toUpperCase();
      // console.log(code);
      await Offers.findOne({ code: code }).then((response) => {
        req.session.coupondiscount = response ? response.discount : 0;
        req.session.couponcode = response ? response.code : "Coupon Invalid";
        return res.render("customers/cart");
      });
    },
  };
}

module.exports = cartController;
