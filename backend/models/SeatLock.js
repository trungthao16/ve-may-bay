const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema({
  trainId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Train", 
    required: true 
  },
  coachNumber: { 
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

// Chống trùng lặp lock: Mỗi ghế trên 1 train chỉ bị lock 1 lần tại 1 thời điểm
seatLockSchema.index({ trainId: 1, coachNumber: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("SeatLock", seatLockSchema);
