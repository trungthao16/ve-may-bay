const crypto = require("crypto");
const qs = require("qs");
const Ticket = require("../models/Ticket");

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;

  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
  }

  return sorted;
}

function formatDate(date) {
  const yyyy = date.getFullYear().toString();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
}

exports.createVNPayPayment = async (req, res) => {
  try {
    const { ticketId, ticketIds } = req.body;
    let idsToPay = [];

    if (ticketIds && Array.isArray(ticketIds) && ticketIds.length > 0) {
      idsToPay = ticketIds;
    } else if (ticketId) {
      idsToPay = [ticketId];
    }

    if (idsToPay.length === 0) {
      return res.status(400).json({ message: "Thiếu ticketId(s)" });
    }

    const tickets = await Ticket.find({ _id: { $in: idsToPay } }).populate("train");
    if (tickets.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    let totalAmount = 0;
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      return res.status(500).json({ message: "Thiếu cấu hình VNPay trong .env" });
    }

    const txnRef = `vnp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    for (const ticket of tickets) {
      if (ticket.user.toString() !== req.user.id) {
        return res.status(403).json({ message: `Không có quyền thanh toán vé ${ticket._id}` });
      }
      if (ticket.paymentStatus === "paid") {
        return res.status(400).json({ message: `Vé ${ticket._id} đã thanh toán rồi` });
      }
      if (ticket.status === "cancelled") {
        return res.status(400).json({ message: `Vé ${ticket._id} đã hủy, không thể thanh toán` });
      }
      
      totalAmount += Number(ticket.price);
      ticket.vnpTxnRef = txnRef;
      await ticket.save();
    }

    const createDate = formatDate(new Date());

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
      vnp_OrderType: "other",
      vnp_Amount: totalAmount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });

    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    vnp_Params.vnp_SecureHash = signed;

    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;

    return res.json({
      message: "Tạo link thanh toán thành công",
      paymentUrl,
    });
  } catch (error) {
    console.error("CREATE VNPAY ERROR:", error);
    return res.status(500).json({
      message: "Lỗi tạo thanh toán VNPay",
      error: error.message,
    });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });

    const signed = crypto
      .createHmac("sha512", process.env.VNP_HASHSECRET)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (secureHash !== signed) {
      return res.status(400).send("Sai chữ ký bảo mật");
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = req.query;

    const tickets = await Ticket.find({ vnpTxnRef: vnp_TxnRef });
    if (tickets.length === 0) {
      return res.status(404).send("Không tìm thấy giao dịch vé");
    }

    if (vnp_ResponseCode === "00") {
      await Ticket.updateMany(
        { vnpTxnRef: vnp_TxnRef },
        { 
          $set: { 
            paymentStatus: "paid",
            paymentMethod: "vnpay",
            paidAt: new Date(),
            vnpTransactionNo: vnp_TransactionNo || null
          }
        }
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/mytickets?payment=success`);
    } else {
      await Ticket.updateMany(
        { vnpTxnRef: vnp_TxnRef },
        { $set: { paymentStatus: "failed" } }
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/mytickets?payment=failed`);
    }
  } catch (error) {
    console.error("VNPAY RETURN ERROR:", error);
    return res.status(500).send("Lỗi xử lý kết quả thanh toán");
  }
};