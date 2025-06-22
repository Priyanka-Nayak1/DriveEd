const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userEmail: String,
  orderStatus: String,
  orderDate: Date,
  instructorId: String,
  instructorName: String,
  courseImage: String,
  courseTitle: String,
  courseId: String,
});

module.exports = mongoose.model("Order", OrderSchema);
