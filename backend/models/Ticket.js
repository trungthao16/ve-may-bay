const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    cabinNumber: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      default: 0,
    },
    passengerName: {
      type: String,
      required: true,
      default: "Khách hàng"
    },
    cccd: {
      type: String,
      required: true,
      default: "000000000000"
    },
    passengerType: {
      type: String,
      enum: ["adult", "student", "child", "senior"],
      default: "adult",
    },
    objectDiscount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    promotionCode: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },

    // Refund fields
    refundAmount: {
      type: Number,
      default: 0,
    },
    cancellationFee: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["vnpay", "cash"],
      default: "vnpay",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    vnpTxnRef: {
      type: String,
      default: null,
    },
    vnpTransactionNo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);