const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    deleted: { type: Boolean, required: true, default: false },
    cartItems: {
      items: [
        {
          productId: { type: String, required: true },
          name: { type: String, required: true },
          category: { type: String, required: true },
          price: { type: Number, required: true },
          image: { type: String, required: true },
          qty: { type: Number, required: true, default: 0 },
        },
      ],
      totalPrice: { type: Number, required: true },
      totalQty: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
