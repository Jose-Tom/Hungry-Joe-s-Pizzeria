const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: { type: Object, required: true },
    totalPrice: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentType: { type: String, default: "COD" },
    paymentStatus: { type: Boolean, default: false },
    paymentID: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: { type: String, default: "order_placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
