const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpiryDateInfoSchema = new Schema({
  name: String,
  userId: String,
  expiry_date: String,
});

const ExpiryDateSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    expiry_dates: {
      type: [ExpiryDateInfoSchema],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Expirydates", ExpiryDateSchema);
