const User = require("../models/User");
const Flight = require("../models/Flight");
const Ticket = require("../models/Ticket");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFlights = await Flight.countDocuments();
    const totalTickets = await Ticket.countDocuments();

    // 1. Chỉ tính vé thành công/đã thanh toán
    const tickets = await Ticket.find({ status: "booked", paymentStatus: "paid" });
    const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);

    // 2. Thống kê biểu đồ loại hành khách
    const passengerTypeStats = await Ticket.aggregate([
      { $match: { status: "booked", paymentStatus: "paid" } },
      { $group: { _id: "$passengerType", count: { $sum: 1 } } }
    ]);
    const passengerStatsMap = {
      adult: { name: "Người lớn", value: 0 },
      child: { name: "Trẻ em", value: 0 },
      student: { name: "Sinh viên", value: 0 },
      senior: { name: "Người già", value: 0 },
    };
    passengerTypeStats.forEach(item => {
      if (passengerStatsMap[item._id]) {
        passengerStatsMap[item._id].value = item.count;
      }
    });

    // 3. Thống kê biểu đồ doanh thu theo 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenueAgg = await Ticket.aggregate([
      { $match: { status: "booked", paymentStatus: "paid", createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$price" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days with 0
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = dailyRevenueAgg.find(r => r._id === dateStr);
      dailyRevenue.push({
        date: dateStr,
        revenue: found ? found.revenue : 0
      });
    }

    // 4. Thống kê Top 5 chuyến bay phổ biến nhất
    const topFlightsAgg = await Ticket.aggregate([
      { $match: { status: "booked", paymentStatus: "paid" } },
      { $group: { _id: "$flight", count: { $sum: 1 }, revenue: { $sum: "$price" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "flights",
          localField: "_id",
          foreignField: "_id",
          as: "flightDetails"
        }
      },
      { $unwind: "$flightDetails" },
      {
        $project: {
          count: 1,
          revenue: 1,
          name: "$flightDetails.flightNumber",
          from: "$flightDetails.from",
          to: "$flightDetails.to"
        }
      }
    ]);

    res.json({
      totalUsers,
      totalFlights,
      totalTickets,
      totalRevenue,
      passengerTypes: Object.values(passengerStatsMap),
      dailyRevenue,
      topFlights: topFlightsAgg
    });
  } catch (error) {
    console.log("getStats error:", error);
    res.status(500).json({ message: error.message });
  }
};