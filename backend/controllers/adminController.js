// const User = require("../models/User");
// const Train = require("../models/Train");
// const Ticket = require("../models/Ticket");

// exports.getStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalTrains = await Train.countDocuments();
//     const totalTickets = await Ticket.countDocuments();

//     const tickets = await Ticket.find().populate("trainId");
//     const totalRevenue = tickets.reduce((sum, ticket) => {
//       return sum + (ticket.trainId?.price || 0);
//     }, 0);

//     res.json({
//       totalUsers,
//       totalTrains,
//       totalTickets,
//       totalRevenue,
//     });
//   } catch (error) {
//     console.log("getStats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// const User = require("../models/User");
// const Train = require("../models/Train");
// const Ticket = require("../models/Ticket");

// const getStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalTrains = await Train.countDocuments();
//     const totalTickets = await Ticket.countDocuments();

//     const revenueData = await Ticket.aggregate([
//       { $match: { status: "booked" } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$price" },
//         },
//       },
//     ]);

//     const totalRevenue = revenueData[0]?.total || 0;

//     res.json({
//       users: totalUsers,
//       trains: totalTrains,
//       tickets: totalTickets,
//       revenue: totalRevenue,
//     });
//   } catch (error) {
//     console.error("❌ Stats error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { getStats };


const User = require("../models/User");
const Train = require("../models/Train");
const Ticket = require("../models/Ticket");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrains = await Train.countDocuments();
    const totalTickets = await Ticket.countDocuments();

    const tickets = await Ticket.find({ status: "booked" }).populate("train");

    const totalRevenue = tickets.reduce((sum, ticket) => {
      return sum + (ticket.train?.price || 0);
    }, 0);

    res.json({
      totalUsers,
      totalTrains,
      totalTickets,
      totalRevenue,
    });
  } catch (error) {
    console.log("getStats error:", error);
    res.status(500).json({ message: error.message });
  }
};