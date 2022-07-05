const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offersSchema = new Schema({
  code: { type: String, required: true },
  discount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("offer", offersSchema);
