

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
//       paymentStatus: "unpaid",
//       paymentMethod: "vnpay",
//     });

//     const populatedTicket = await Ticket.findById(ticket._id)
//       .populate("user", "name email")
//       .populate("train");

//     res.status(201).json(populatedTicket);
//   } catch (error) {
//     console.error("CREATE TICKET ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getMyTickets = async (req, res) => {
//   try {
//     const tickets = await Ticket.find({ user: req.user.id })
//       .populate("train")
//       .sort({ createdAt: -1 });

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

//     if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
//       return res.status(403).json({ message: "Không có quyền hủy vé này" });
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
//       .populate("train")
//       .sort({ createdAt: -1 });

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
const Promotion = require("../models/Promotion");

exports.createTicket = async (req, res) => {
  try {
    const {
      trainId,
      seatNumber,
      promotionCode,
      discountAmount = 0,
      finalPrice,
    } = req.body;

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

    let validPromotionCode = null;
    let validDiscountAmount = 0;
    let finalTicketPrice = Number(train.price);

    if (promotionCode) {
      const promotion = await Promotion.findOne({
        code: promotionCode.trim().toUpperCase(),
        isActive: true,
      });

      const now = new Date();

      if (
        promotion &&
        promotion.startDate <= now &&
        promotion.endDate >= now &&
        Number(train.price) >= (promotion.minOrderValue || 0)
      ) {
        let recalculatedDiscount = 0;

        if (promotion.discountType === "percent") {
          recalculatedDiscount =
            (Number(train.price) * promotion.discountValue) / 100;

          if (promotion.maxDiscount > 0) {
            recalculatedDiscount = Math.min(
              recalculatedDiscount,
              promotion.maxDiscount
            );
          }
        } else if (promotion.discountType === "fixed") {
          recalculatedDiscount = promotion.discountValue;
        }

        validPromotionCode = promotion.code;
        validDiscountAmount = recalculatedDiscount;
        finalTicketPrice = Math.max(Number(train.price) - recalculatedDiscount, 0);
      }
    }

    // nếu không có mã thì vẫn cho dùng giá từ backend chuẩn
    // không tin hoàn toàn discountAmount/finalPrice từ frontend
    const ticket = await Ticket.create({
      user: req.user.id,
      train: trainId,
      seatNumber,
      price: finalTicketPrice,
      originalPrice: Number(train.price),
      promotionCode: validPromotionCode,
      discountAmount: validDiscountAmount,
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