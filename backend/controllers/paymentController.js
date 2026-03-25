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
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: "Thiếu ticketId" });
    }

    const ticket = await Ticket.findById(ticketId).populate("train");
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền thanh toán vé này" });
    }

    if (ticket.paymentStatus === "paid") {
      return res.status(400).json({ message: "Vé này đã thanh toán rồi" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Vé đã hủy, không thể thanh toán" });
    }

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    console.log("TMNCODE:", tmnCode);
    console.log("HASHSECRET:", secretKey);
    console.log("VNP_URL:", vnpUrl);
    console.log("RETURN_URL:", returnUrl);

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      return res.status(500).json({ message: "Thiếu cấu hình VNPay trong .env" });
    }

    const createDate = formatDate(new Date());
    const txnRef = `${ticket._id}_${Date.now()}`;

    ticket.vnpTxnRef = txnRef;
    await ticket.save();

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
      vnp_OrderInfo: `Thanh toan ve tau ${ticket._id}`,
      vnp_OrderType: "other",
      vnp_Amount: Number(ticket.price) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    console.log("SIGN DATA:", signData);

    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    console.log("SIGNED:", signed);

    vnp_Params.vnp_SecureHash = signed;

    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;
    console.log("PAYMENT URL:", paymentUrl);

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
    console.log("RETURN SIGN DATA:", signData);

    const signed = crypto
      .createHmac("sha512", process.env.VNP_HASHSECRET)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    console.log("RETURN SECURE HASH:", secureHash);
    console.log("RETURN SIGNED:", signed);

    if (secureHash !== signed) {
      return res.status(400).send("Sai chữ ký bảo mật");
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = req.query;

    const ticket = await Ticket.findOne({ vnpTxnRef: vnp_TxnRef });
    if (!ticket) {
      return res.status(404).send("Không tìm thấy vé");
    }

    if (vnp_ResponseCode === "00") {
      ticket.paymentStatus = "paid";
      ticket.paymentMethod = "vnpay";
      ticket.paidAt = new Date();
      ticket.vnpTransactionNo = vnp_TransactionNo || null;
      await ticket.save();

      return res.redirect("http://localhost:3000/mytickets?payment=success");
    } else {
      ticket.paymentStatus = "failed";
      await ticket.save();

      return res.redirect("http://localhost:3000/mytickets?payment=failed");
    }
  } catch (error) {
    console.error("VNPAY RETURN ERROR:", error);
    return res.status(500).send("Lỗi xử lý kết quả thanh toán");
  }
};