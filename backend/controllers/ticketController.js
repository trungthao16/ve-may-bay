
// const Ticket = require("../models/Ticket");
// const Train = require("../models/Train");

// exports.createTicket = async (req, res) => {
//   try {
//     const { trainId, seatNumber } = req.body;

//     if (!trainId || !seatNumber) {
//       return res.status(400).json({ message: "Thiếu trainId hoặc seatNumber" });
//     }

//     const train = await Train.findById(trainId);
//     if (!train) {
//       return res.status(404).json({ message: "Không tìm thấy chuyến tàu" });
//     }

//     const existingTicket = await Ticket.findOne({
//       train: trainId,
//       seatNumber,
//       status: "booked",
//     });

//     if (existingTicket) {
//       return res.status(400).json({ message: "Ghế này đã được đặt" });
//     }

//     const ticket = await Ticket.create({
//       user: req.user.id,
//       train: trainId,
//       seatNumber,
//       price: train.price,
//       status: "booked",
//     });

//     res.status(201).json(ticket);
//   } catch (error) {
//     console.error("CREATE TICKET ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getMyTickets = async (req, res) => {
//   try {
//     const tickets = await Ticket.find({ user: req.user.id }).populate("train");
//     res.json(tickets);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.cancelTicket = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({ message: "Không tìm thấy vé" });
//     }

//     ticket.status = "cancelled";
//     await ticket.save();

//     res.json({ message: "Hủy vé thành công", ticket });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getAllTickets = async (req, res) => {
//   try {
//     const tickets = await Ticket.find()
//       .populate("user", "name email")
//       .populate("train");
//     res.json(tickets);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.deleteTicket = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({ message: "Không tìm thấy vé" });
//     }

//     await ticket.deleteOne();
//     res.json({ message: "Xóa vé thành công" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Ticket = require("../models/Ticket");
const Train = require("../models/Train");

exports.createTicket = async (req, res) => {
  try {
    const { trainId, seatNumber } = req.body;

    if (!trainId || !seatNumber) {
      return res.status(400).json({ message: "Thiếu trainId hoặc seatNumber" });
    }

    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Không tìm thấy chuyến tàu" });
    }

    const existingTicket = await Ticket.findOne({
      train: trainId,
      seatNumber,
      status: "booked",
    });

    if (existingTicket) {
      return res.status(400).json({ message: "Ghế này đã được đặt" });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      train: trainId,
      seatNumber,
      price: train.price,
      status: "booked",
      paymentStatus: "unpaid",
      paymentMethod: "vnpay",
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("user", "name email")
      .populate("train");

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate("train")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Không có quyền hủy vé này" });
    }

    ticket.status = "cancelled";
    await ticket.save();

    res.json({ message: "Hủy vé thành công", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email")
      .populate("train")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    await ticket.deleteOne();
    res.json({ message: "Xóa vé thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};