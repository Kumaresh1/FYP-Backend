const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocumentInfoSchema = new Schema({
  name: [String],
  start_date: [String],
  expiry_date: [String],
  description: [String],
  imageUrl: [String],
});

const DocumentSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    document: {
      type: [DocumentInfoSchema],
    },
    familyMembers: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Documents", DocumentSchema);
