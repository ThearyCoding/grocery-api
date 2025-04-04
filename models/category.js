const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
});

const category = mongoose.model("Category", categorySchema);

module.exports = category;
