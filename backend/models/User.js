// const mongoose = require("mongoose")

// const userSchema = new mongoose.Schema({
//     name:String,
//     email:String,
//     password:String,
//     role:{
//         type:String,
//         enum:["user","staff","admin"],
//         default:"user"
//     }
// })

// module.exports = mongoose.model("User",userSchema)

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("User", userSchema)