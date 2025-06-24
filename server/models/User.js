const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user", // optional default
  },
  faceDescriptor: {
    type: [Number],
    required: true,
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length > 0,
      message: "Face descriptor must be a non-empty array of numbers.",
    },
  },
});

module.exports = mongoose.model("User", UserSchema);
