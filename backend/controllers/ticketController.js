const Ticket = require("../models/Ticket");
const Flight = require("../models/Flight");
const Promotion = require("../models/Promotion");

exports.createTicket = async (req, res) => {
  try {
    const {
      flightId,
      passengers, // Mảng các hành khách: [{ name, cccd, type, cabinNumber, seatNumber }]
      promotionCode,
    } = req.body;

    if (!flightId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin hành khách hoặc chuyến bay" });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
    }

    const createdTickets = [];
    const promotion = promotionCode ? await Promotion.findOne({
      code: promotionCode.trim().toUpperCase(),
      isActive: true,
    }) : null;

    const now = new Date();

    for (const p of passengers) {
      const { name, cccd, type, cabinNumber, seatNumber } = p;

      if (!name || !cccd || !cabinNumber || !seatNumber) {
        throw new Error(`Hành khách ${name || ""} thiếu thông tin bắt buộc`);
      }

      // Kiểm tra ghế đã được đặt chưa
      const existingTicket = await Ticket.findOne({
        flight: flightId,
        cabinNumber: Number(cabinNumber),
        seatNumber: seatNumber.toString(),
        status: "booked",
      });

      if (existingTicket) {
        throw new Error(`Ghế ${seatNumber} khoang ${cabinNumber} đã được đặt bởi người khác`);
      }

      // Tính giá dựa theo loại khoang
      let basePrice = Number(flight.price);
      if (flight.cabins && flight.cabins.length > 0) {
        const cabin = flight.cabins.find(c => c.cabinNumber === Number(cabinNumber));
        if (cabin && cabin.priceMultiplier && cabin.priceMultiplier !== 1) {
          basePrice = Math.round(basePrice * cabin.priceMultiplier);
        }
      }

      // Logic giảm giá theo đối tượng
      let objectDiscountRate = 0;
      const pType = type || "adult";
      if (pType === "child") objectDiscountRate = 0.25;
      else if (pType === "student") objectDiscountRate = 0.10;
      else if (pType === "senior") objectDiscountRate = 0.15;

      const objectDiscount = Math.round(basePrice * objectDiscountRate);
      const priceAfterObjectDiscount = basePrice - objectDiscount;

      let validPromotionCode = null;
      let validDiscountAmount = 0;
      let finalTicketPrice = priceAfterObjectDiscount;

      // Áp dụng khuyến mãi nếu có
      if (promotion &&
          promotion.startDate <= now &&
          promotion.endDate >= now &&
          priceAfterObjectDiscount >= (promotion.minOrderValue || 0)
      ) {
        let recalculatedDiscount = 0;
        if (promotion.discountType === "percent") {
          recalculatedDiscount = Math.round((priceAfterObjectDiscount * promotion.discountValue) / 100);
          if (promotion.maxDiscount > 0) {
            recalculatedDiscount = Math.min(recalculatedDiscount, promotion.maxDiscount);
          }
        } else if (promotion.discountType === "fixed") {
          recalculatedDiscount = promotion.discountValue;
        }

        validPromotionCode = promotion.code;
        validDiscountAmount = recalculatedDiscount;
        finalTicketPrice = Math.max(priceAfterObjectDiscount - recalculatedDiscount, 0);
      }

      const ticket = await Ticket.create({
        user: req.user.id,
        flight: flightId,
        seatNumber: seatNumber.toString(),
        cabinNumber: Number(cabinNumber),
        originalPrice: basePrice,
        passengerName: name,
        cccd: cccd,
        passengerType: pType,
        objectDiscount,
        discountAmount: validDiscountAmount,
        promotionCode: validPromotionCode,
        price: finalTicketPrice,
        status: "booked",
        paymentStatus: "unpaid",
        paymentMethod: "vnpay",
      });

      createdTickets.push(ticket);
    }

    // Xóa tất cả SeatLock của user này cho chuyến bay này sau khi đặt thành công
    const SeatLock = require("../models/SeatLock");
    await SeatLock.deleteMany({ flightId, lockedBy: req.user.id });

    res.status(201).json({
      message: `Đã đặt thành công ${createdTickets.length} vé`,
      tickets: createdTickets
    });
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate("flight")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("flight");

    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Không có quyền hủy vé này" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Vé này đã được hủy trước đó" });
    }

    let refundAmount = 0;
    let cancellationFee = 0;

    // Chỉ tính tiền hoàn lại nếu vé đã được thanh toán
    if (ticket.paymentStatus === "paid" && ticket.flight) {
      const now = new Date();
      
      // Kết hợp departureDate và departureTime để có thời điểm khởi hành chính xác
      const depDate = new Date(ticket.flight.departureDate); // YYYY-MM-DD
      const [hours, minutes] = (ticket.flight.departureTime || "00:00").split(":");
      depDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

      const timeDiffMs = depDate - now;
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        // Hủy trước > 24h: Hoàn 90%, Phí 10%
        cancellationFee = Math.round(ticket.price * 0.1);
        refundAmount = ticket.price - cancellationFee;
      } else if (hoursDiff >= 4) {
        // Hủy từ 4h - 24h: Hoàn 50%, Phí 50%
        cancellationFee = Math.round(ticket.price * 0.5);
        refundAmount = ticket.price - cancellationFee;
      } else {
        // Hủy dưới 4h: Không hoàn tiền, Phí 100%
        cancellationFee = ticket.price;
        refundAmount = 0;
      }
    }

    ticket.status = "cancelled";
    ticket.refundAmount = refundAmount;
    ticket.cancellationFee = cancellationFee;
    await ticket.save();

    let message = "Hủy vé thành công!";
    if (ticket.paymentStatus === "paid") {
      if (refundAmount > 0) {
        message = `Hủy vé thành công! Số tiền hoàn lại: ${refundAmount.toLocaleString("vi-VN")}đ (Phí hủy: ${cancellationFee.toLocaleString("vi-VN")}đ)`;
      } else {
        message = "Hủy vé thành công! Vé hủy dưới 4h không được hoàn tiền.";
      }
    }

    res.json({ 
      message, 
      ticket: {
        _id: ticket._id,
        status: ticket.status,
        refundAmount: ticket.refundAmount,
        cancellationFee: ticket.cancellationFee
      } 
    });
  } catch (error) {
    console.error("CANCEL TICKET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email")
      .populate("flight")
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