import { useEffect, useState } from "react";
import API from "../api/axios";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/tickets/my");
        setTickets(res.data || []);
      } catch (error) {
        console.log("Lỗi lấy vé của tôi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      alert("Thanh toán VNPay thành công!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (paymentStatus === "failed") {
      alert("Thanh toán VNPay thất bại hoặc bị hủy.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const refreshTickets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/tickets/my");
      setTickets(res.data || []);
    } catch (error) {
      console.log("Lỗi lấy vé của tôi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (ticketId) => {
    try {
      await API.put(`/tickets/${ticketId}/cancel`);
      alert("Hủy vé thành công!");
      refreshTickets();
    } catch (error) {
      console.log("Lỗi hủy vé:", error);
      alert(error.response?.data?.message || "Hủy vé thất bại.");
    }
  };

  const handleVNPay = async (ticketId) => {
    try {
      const res = await API.post("/payment/create-vnpay", { ticketId });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert("Không lấy được link thanh toán.");
      }
    } catch (error) {
      console.log("Lỗi tạo thanh toán VNPay:", error);
      alert(error.response?.data?.message || "Không tạo được link thanh toán.");
    }
  };

  const renderPaymentText = (ticket) => {
    if (ticket.paymentStatus === "paid") return "Đã thanh toán";
    if (ticket.paymentStatus === "failed") return "Thanh toán thất bại";
    return "Chưa thanh toán";
  };

  if (!user) {
    return (
      <div className="rv-container mytickets-page">
        <div className="empty-box">Bạn cần đăng nhập để xem vé của mình.</div>
      </div>
    );
  }

  return (
    <div className="rv-container mytickets-page">
      <div className="trainlist-header">
        <p className="section-label">Quản lý vé</p>
        <h1 className="trainlist-title">Vé của tôi</h1>
      </div>

      {loading ? (
        <div className="empty-box">Đang tải danh sách vé...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-box">Bạn chưa đặt vé nào.</div>
      ) : (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <div className="ticket-card" key={ticket._id}>
              <div className="ticket-status">
                {ticket.status === "cancelled" ? "Đã hủy" : "Đã đặt"}
              </div>

              <h3>{ticket.train?.name || ticket.train?.trainName || "Chuyến tàu"}</h3>

              <p>
                <strong>Tuyến:</strong> {ticket.train?.from} → {ticket.train?.to}
              </p>

              <p>
                <strong>Ghế:</strong> {ticket.seatNumber}
              </p>

              <p>
                <strong>Ngày khởi hành:</strong>{" "}
                {ticket.train?.departureDate
                  ? new Date(ticket.train.departureDate).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </p>

              <p>
                <strong>Khởi hành:</strong> {ticket.train?.departureTime || "Chưa có"}
              </p>

              <p>
                <strong>Giá:</strong>{" "}
                {(ticket.price || ticket.train?.price || 0).toLocaleString("vi-VN")}đ
              </p>

              <p>
                <strong>Thanh toán:</strong> {renderPaymentText(ticket)}
              </p>

              <p>
                <strong>Phương thức:</strong> {ticket.paymentMethod || "vnpay"}
              </p>

              {ticket.paidAt && (
                <p>
                  <strong>Thời gian thanh toán:</strong>{" "}
                  {new Date(ticket.paidAt).toLocaleString("vi-VN")}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  flexWrap: "wrap",
                }}
              >
                {ticket.status !== "cancelled" && ticket.paymentStatus !== "paid" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleVNPay(ticket._id)}
                  >
                    Thanh toán VNPay
                  </button>
                )}

                {ticket.status !== "cancelled" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(ticket._id)}
                  >
                    Hủy vé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;