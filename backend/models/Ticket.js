

// const mongoose = require("mongoose");

// const ticketSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     train: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Train",
//       required: true,
//     },
//     seatNumber: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["booked", "cancelled"],
//       default: "booked",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Ticket", ticketSchema);

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
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

    // thêm phần thanh toán
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