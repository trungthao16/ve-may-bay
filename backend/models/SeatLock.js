const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema({
  flightId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Flight", 
    required: true 
  },
  cabinNumber: { 
    type: Number, 
    required: true 
  },
  seatNumber: { 
    type: String, 
    required: true 
  },
  lockedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  // Document sẽ tự động xóa sau 600 giây (10 phút) kể từ lúc tạo
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600 
  }
});

// Chống trùng lặp lock: Mỗi ghế trên 1 flight chỉ bị lock 1 lần tại 1 thời điểm
seatLockSchema.index({ flightId: 1, cabinNumber: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("SeatLock", seatLockSchema);
