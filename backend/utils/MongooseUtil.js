const mongoose = require("mongoose");
const MyConstants = require("./MyConstants");

const uri = `mongodb+srv://${MyConstants.DB_USER}:${MyConstants.DB_PASS}@${MyConstants.DB_SERVER}/${MyConstants.DB_DATABASE}`;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Atlas Connected");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;