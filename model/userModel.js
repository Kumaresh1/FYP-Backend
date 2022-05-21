const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    fcm_token: {
      type: String,
    },
    userType: {
      type: String,
      default: "User",
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("users", UserSchema);
