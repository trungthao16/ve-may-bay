const mongoose = require("mongoose")

const cabinSchema = new mongoose.Schema({
    cabinNumber: { type: Number, required: true },
    cabinType: { type: String, enum: ["economy", "business"], default: "economy" },
    capacity: { type: Number, required: true },
    priceMultiplier: { type: Number, default: 1 } // To adjust price based on cabin type
});

const flightSchema = new mongoose.Schema({
    flightNumber: String,
    from: String,
    to: String,
    departureDate: Date,
    departureTime: String,
    arrivalTime: String,
    price: Number,
    totalSeats: Number,
    cabins: [cabinSchema]
})

// Index để tìm kiếm nhanh
flightSchema.index({ from: 1, to: 1, departureDate: 1 });
flightSchema.index({ departureDate: 1 });

module.exports = mongoose.model("Flight", flightSchema)