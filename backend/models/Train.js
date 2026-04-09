const mongoose = require("mongoose")

const coachSchema = new mongoose.Schema({
    coachNumber: { type: Number, required: true },
    coachType: { type: String, enum: ["soft_seat", "sleeper"], default: "soft_seat" },
    capacity: { type: Number, required: true },
    priceMultiplier: { type: Number, default: 1 } // To adjust price based on coach type
});

const trainSchema = new mongoose.Schema({
    trainName:String,
    from:String,
    to:String,
    departureDate: Date,
    departureTime:String,
    arrivalTime:String,
    price:Number,
    totalSeats:Number,
    coaches: [coachSchema]
})

// Index để tìm kiếm nhanh
trainSchema.index({ from: 1, to: 1, departureDate: 1 });
trainSchema.index({ departureDate: 1 });

module.exports = mongoose.model("Train",trainSchema)