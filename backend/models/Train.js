const mongoose = require("mongoose")

const trainSchema = new mongoose.Schema({
    trainName:String,
    from:String,
    to:String,
    departureDate: Date,
    departureTime:String,
    arrivalTime:String,
    price:Number,
    totalSeats:Number
})

module.exports = mongoose.model("Train",trainSchema)