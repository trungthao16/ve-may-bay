const Flight = require("../models/Flight");
const Ticket = require("../models/Ticket");
const SeatLock = require("../models/SeatLock");

// lấy danh sách chuyến bay
exports.getFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ _id: -1 }).limit(100);
    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// lấy danh sách sân bay từ DB
exports.getAirports = async (req, res) => {
  try {
    const fromAirports = await Flight.distinct("from");
    const toAirports = await Flight.distinct("to");
    const allAirports = [...new Set([...fromAirports, ...toAirports])].sort();
    res.json(allAirports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// lấy chi tiết 1 chuyến bay
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        message: "Không tìm thấy chuyến bay",
      });
    }

    res.json(flight);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// tạo chuyến bay
exports.createFlight = async (req, res) => {
  try {
    const flightData = { ...req.body };
    
    // Auto-generate cabins if not provided
    if (!flightData.cabins || flightData.cabins.length === 0) {
      flightData.cabins = [
        { cabinNumber: 1, cabinType: "business", capacity: 16, priceMultiplier: 2.5 },
        { cabinNumber: 2, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
        { cabinNumber: 3, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
        { cabinNumber: 4, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
      ];
      flightData.totalSeats = flightData.cabins.reduce((acc, cabin) => acc + cabin.capacity, 0);
    }

    const flight = new Flight(flightData);
    await flight.save();
    res.json(flight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// cập nhật chuyến bay
exports.updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(flight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// xóa chuyến bay
exports.deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);

    res.json({
      message: "Đã xóa chuyến bay",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchFlights = async (req, res) => {
  try {
    const { from = "", to = "", date = "", tripType = "", groupSize = "" } = req.query;

    const query = {};

    if (from) query.from = { $regex: from, $options: "i" };
    if (to) query.to = { $regex: to, $options: "i" };

    if (date) {
      const searchDate = new Date(date + "T00:00:00");
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const startUTC = new Date(searchDate.getTime() - 7 * 60 * 60 * 1000);
      const endUTC = new Date(nextDay.getTime() - 7 * 60 * 60 * 1000);
      query.departureDate = { $gte: startUTC, $lt: endUTC };
    } else {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayUTC = new Date(todayStart.getTime() - 7 * 60 * 60 * 1000);
      query.departureDate = { $gte: todayUTC };
    }

    let flights = await Flight.find(query)
      .select("-cabins")
      .sort({ departureDate: 1, departureTime: 1 })
      .limit(50)
      .lean();

    const flightIds = flights.map(f => f._id);
    const bookedCounts = await Ticket.aggregate([
      { $match: { status: "booked", flight: { $in: flightIds } } },
      { $group: { _id: "$flight", count: { $sum: 1 } } }
    ]);

    const bookedMap = {};
    bookedCounts.forEach(b => {
      bookedMap[b._id.toString()] = b.count;
    });

    flights = flights.map(flight => {
      const booked = bookedMap[flight._id.toString()] || 0;
      const total = flight.totalSeats || flight.seats || 0;
      return {
        ...flight,
        bookedSeats: booked,
        availableSeats: Math.max(total - booked, 0)
      };
    });

    if (tripType === "group" && groupSize) {
      const groupNumber = parseInt(groupSize, 10);

      if (!isNaN(groupNumber)) {
        flights = flights.filter((flight) => {
          return flight.availableSeats >= groupNumber;
        });
      }
    }

    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách ghế đã đặt hoặc đang giữ chỗ của một chuyến bay
exports.getBookedSeats = async (req, res) => {
  try {
    const { flightId } = req.params;
    
    const tickets = await Ticket.find({
      flight: flightId,
      status: "booked"
    }).select("cabinNumber seatNumber paymentStatus").lean();

    const locks = await SeatLock.find({
      flightId: flightId
    }).select("cabinNumber seatNumber lockedBy").lean();

    const lockedSeats = locks.map(lock => ({
      cabinNumber: lock.cabinNumber,
      seatNumber: lock.seatNumber,
      isLocked: true,
      lockedBy: lock.lockedBy
    }));

    res.json([...tickets, ...lockedSeats]);
  } catch (error) {
    console.error("Lỗi lấy danh sách ghế:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy dữ liệu ghế" });
  }
};

// Khóa ghế (Giữ chỗ)
exports.lockSeat = async (req, res) => {
  try {
    const { flightId } = req.params;
    const { cabinNumber, seatNumber } = req.body;
    const userId = req.user.id;

    if (!cabinNumber || !seatNumber) {
      return res.status(400).json({ message: "Vui lòng truyền số khoang và số ghế" });
    }

    const newLock = new SeatLock({
      flightId,
      cabinNumber: Number(cabinNumber),
      seatNumber: seatNumber.toString(),
      lockedBy: userId
    });

    await newLock.save();
    res.json({ message: "Giữ chỗ thành công trong 10 phút" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ghế này hiện đang có người khác giữ chỗ. Vui lòng chọn ghế khác!" });
    }
    console.error("Lỗi lockSeat:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi giữ chỗ" });
  }
};