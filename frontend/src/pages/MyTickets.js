import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import CancelTicketModal from "../components/CancelTicketModal";
import TicketQRCode from "../components/TicketQRCode";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketToCancel, setTicketToCancel] = useState(null);

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
      toast.success("Thanh toán VNPay thành công!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (paymentStatus === "failed") {
      toast.error("Thanh toán VNPay thất bại hoặc bị hủy.");
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

  const confirmCancel = async () => {
    if (!ticketToCancel) return;

    try {
      const res = await API.put(`/tickets/${ticketToCancel._id}/cancel`);
      toast.success(res.data.message || "Đã hủy vé thành công!");
      setTicketToCancel(null);
      refreshTickets();
    } catch (error) {
      console.log("Lỗi hủy vé:", error);
      toast.error(error.response?.data?.message || "Hủy vé thất bại.");
    }
  };

  const handleVNPay = async (ticketId) => {
    try {
      const res = await API.post("/payment/create-vnpay", { ticketId });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error("Không lấy được link thanh toán.");
      }
    } catch (error) {
      console.log("Lỗi tạo thanh toán VNPay:", error);
      toast.error(error.response?.data?.message || "Không tạo được link thanh toán.");
    }
  };

  const handleVNPayGroup = async (groupTickets) => {
    const unpaidTickets = groupTickets.filter(
      (ticket) => ticket.status !== "cancelled" && ticket.paymentStatus !== "paid"
    );

    if (unpaidTickets.length === 0) return;

    try {
      const ticketIds = unpaidTickets.map((ticket) => ticket._id);
      const res = await API.post("/payment/create-vnpay", { ticketIds });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error("Không lấy được link thanh toán.");
      }
    } catch (error) {
      console.log("Lỗi tạo thanh toán VNPay:", error);
      toast.error(error.response?.data?.message || "Không tạo được link thanh toán.");
    }
  };

  const renderPaymentText = (ticket) => {
    if (ticket.paymentStatus === "paid") return "Đã thanh toán";
    if (ticket.paymentStatus === "failed") return "Thanh toán thất bại";
    return "Chưa thanh toán";
  };

  const groupedOrders = [];
  if (tickets.length > 0) {
    let currentGroup = [tickets[0]];
    groupedOrders.push(currentGroup);

    for (let i = 1; i < tickets.length; i += 1) {
      const previousTicket = currentGroup[currentGroup.length - 1];
      const currentTicket = tickets[i];
      const timeDiff =
        previousTicket.createdAt && currentTicket.createdAt
          ? Math.abs(new Date(previousTicket.createdAt) - new Date(currentTicket.createdAt))
          : 0;

      if (timeDiff < 5000) {
        currentGroup.push(currentTicket);
      } else {
        currentGroup = [currentTicket];
        groupedOrders.push(currentGroup);
      }
    }
  }

  if (!user) {
    return (
      <div className="rv-container mytickets-page">
        <div className="empty-box">Bạn cần đăng nhập để xem vé của mình.</div>
      </div>
    );
  }

  return (
    <div className="rv-container mytickets-page">
      <div className="flightlist-header mytickets-header">
        <p className="section-label">Quản lý vé</p>
        <h1 className="flightlist-title mytickets-title">Vé của tôi</h1>
      </div>

      {loading ? (
        <div className="empty-box">Đang tải danh sách vé...</div>
      ) : groupedOrders.length === 0 ? (
        <div className="empty-box">Bạn chưa đặt vé nào.</div>
      ) : (
        <div className="orders-container">
          {groupedOrders.map((group, groupIndex) => {
            const unpaidTickets = group.filter(
              (ticket) => ticket.paymentStatus !== "paid" && ticket.status !== "cancelled"
            );
            const unpaidTotal = unpaidTickets.reduce(
              (sum, ticket) => sum + Number(ticket.price || 0),
              0
            );

            return (
              <div key={groupIndex} className="order-group">
                <div className="order-group__header">
                  <div>
                    <h3 className="order-group__title">
                      Ngày đặt:{" "}
                      {group[0].createdAt
                        ? new Date(group[0].createdAt).toLocaleString("vi-VN")
                        : "Không xác định"}
                    </h3>
                    <p className="order-group__meta">Bao gồm {group.length} vé</p>
                  </div>

                  {unpaidTickets.length > 0 && (
                    <div className="order-group__payment">
                      <div>
                        <span className="order-group__payment-label">
                          Chưa thanh toán ({unpaidTickets.length} vé)
                        </span>
                        <div className="order-group__payment-total">
                          {unpaidTotal.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                      <button
                        type="button"
                        className="order-group__payment-button"
                        onClick={() => handleVNPayGroup(group)}
                      >
                        Thanh toán
                      </button>
                    </div>
                  )}
                </div>

                <div className="ticket-grid">
                  {group.map((ticket) => (
                    <div className="ticket-card ticket-card--elevated" key={ticket._id}>
                      <div className="ticket-status">
                        {ticket.status === "cancelled" ? "Đã hủy" : "Đã đặt"}
                      </div>

                      <h3 className="ticket-card__title">
                        {ticket.train?.name || ticket.train?.flightNumber || "Chuyến bay"}
                      </h3>

                      <p>
                        <strong>Mã vé:</strong>{" "}
                        <span className="ticket-code">#{String(ticket._id).slice(-6).toUpperCase()}</span>
                      </p>

                      <div className="ticket-passenger-box">
                        <p className="ticket-passenger-box__row">
                          <strong>KH:</strong> {ticket.passengerName || "Trống"}
                        </p>
                        <p className="ticket-passenger-box__subrow">
                          <strong>CCCD:</strong> {ticket.cccd || "Trống"} | <strong>Loại:</strong>{" "}
                          {ticket.passengerType === "child"
                            ? "Trẻ em"
                            : ticket.passengerType === "student"
                              ? "Sinh viên"
                              : ticket.passengerType === "senior"
                                ? "Người cao tuổi"
                                : "Người lớn"}
                        </p>
                      </div>

                      <p>
                        <strong>Tuyến:</strong> {ticket.train?.from} → {ticket.train?.to}
                      </p>

                      <p>
                        <strong>Vị trí:</strong> Khoang {ticket.coachNumber} - Chỗ {ticket.seatNumber}
                      </p>

                      <p>
                        <strong>Khởi hành:</strong> {ticket.train?.departureTime || "Chưa có"} -{" "}
                        {ticket.train?.departureDate
                          ? new Date(ticket.train.departureDate).toLocaleDateString("vi-VN")
                          : "Chưa có"}
                      </p>

                      {ticket.discountAmount > 0 ? (
                        <div className="ticket-price-breakdown">
                          <p className="ticket-price-breakdown__row">
                            <strong>Giá gốc:</strong>{" "}
                            <span className="ticket-price-breakdown__original">
                              {(ticket.originalPrice || ticket.train?.price || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </p>
                          <p className="ticket-price-breakdown__discount">
                            <strong>Giảm giá:</strong> -{Number(ticket.discountAmount).toLocaleString("vi-VN")}đ
                            {ticket.promotionCode && (
                              <span className="ticket-price-breakdown__badge">{ticket.promotionCode}</span>
                            )}
                          </p>
                          <p className="ticket-price-breakdown__row">
                            <strong>Thành tiền:</strong>{" "}
                            <span className="ticket-price-breakdown__final">
                              {Number(ticket.price || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p>
                          <strong>Giá vé:</strong>{" "}
                          <span className="ticket-price-breakdown__final">
                            {Number(ticket.price || ticket.train?.price || 0).toLocaleString("vi-VN")}đ
                          </span>
                        </p>
                      )}

                      <p className="ticket-payment-status">
                        <strong>TT:</strong> {renderPaymentText(ticket)}
                      </p>

                      <div className="ticket-actions">
                        {ticket.status !== "cancelled" && ticket.paymentStatus !== "paid" && (
                          <button
                            type="button"
                            className="cancel-btn ticket-action-btn"
                            onClick={() => handleVNPay(ticket._id)}
                          >
                            Thanh toán lẻ
                          </button>
                        )}

                        {ticket.status !== "cancelled" && ticket.paymentStatus === "paid" && (
                          <button
                            type="button"
                            className="cancel-btn ticket-action-btn ticket-action-btn--primary"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            Xem vé điện tử
                          </button>
                        )}

                        {ticket.status !== "cancelled" && (
                          <button
                            type="button"
                            className="cancel-btn ticket-action-btn"
                            onClick={() => setTicketToCancel(ticket)}
                          >
                            Hủy vé
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTicket && (
        <TicketQRCode ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}

      {ticketToCancel && (
        <CancelTicketModal
          ticket={ticketToCancel}
          onClose={() => setTicketToCancel(null)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}

export default MyTickets;
