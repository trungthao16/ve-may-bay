import { useEffect, useState } from "react";
import API from "../api/axios";
import TicketQRCode from "../components/TicketQRCode";
import CancelTicketModal from "../components/CancelTicketModal";
import toast from "react-hot-toast";

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
      toast.success("🎉 Thanh toán VNPay thành công!");
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

  const handleCancelClick = (ticket) => {
    setTicketToCancel(ticket);
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

  const renderPaymentText = (ticket) => {
    if (ticket.paymentStatus === "paid") return "Đã thanh toán";
    if (ticket.paymentStatus === "failed") return "Thanh toán thất bại";
    return "Chưa thanh toán";
  };


  const groupedOrders = [];
  if (tickets && tickets.length > 0) {
    let currentGroup = [tickets[0]];
    groupedOrders.push(currentGroup);

    for (let i = 1; i < tickets.length; i++) {
      const prevTicket = currentGroup[currentGroup.length - 1];
      const currTicket = tickets[i];
      const timeDiff = prevTicket.createdAt && currTicket.createdAt ? Math.abs(new Date(prevTicket.createdAt) - new Date(currTicket.createdAt)) : 0;

      if (timeDiff < 5000) {
        currentGroup.push(currTicket);
      } else {
        currentGroup = [currTicket];
        groupedOrders.push(currentGroup);
      }
    }
  }

  const handleVNPayGroup = async (groupTickets) => {
    const unpaidTickets = groupTickets.filter(
      (t) => t.status !== "cancelled" && t.paymentStatus !== "paid"
    );
    if (unpaidTickets.length === 0) return;

    try {
      const ticketIds = unpaidTickets.map((t) => t._id);
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
      ) : groupedOrders.length === 0 ? (
        <div className="empty-box">Bạn chưa đặt vé nào.</div>
      ) : (
        <div className="orders-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {groupedOrders.map((group, gIndex) => {
            const groupUnpaidCount = group.filter(t => t.paymentStatus !== "paid" && t.status !== "cancelled").length;
            const groupUnpaidTotal = group.filter(t => t.paymentStatus !== "paid" && t.status !== "cancelled").reduce((s, t) => s + Number(t.price), 0);

            return (
              <div key={gIndex} className="order-group" style={{ background: '#fafafa', border: '1px solid #eaeaea', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #ddd' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Ngày đặt: {group[0].createdAt ? new Date(group[0].createdAt).toLocaleString("vi-VN") : "Không xác định"}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Bao gồm {group.length} vé</p>
                  </div>

                  {groupUnpaidCount > 0 && (
                    <div style={{ background: '#fff3cd', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #ffeeba' }}>
                      <div>
                        <span style={{ fontSize: '13px', color: '#856404' }}>Chưa thanh toán ({groupUnpaidCount} vé)</span>
                        <div style={{ fontWeight: 'bold', color: '#c9503a', fontSize: '16px' }}>{groupUnpaidTotal.toLocaleString()}đ</div>
                      </div>
                      <button onClick={() => handleVNPayGroup(group)} style={{ background: '#c9503a', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Thanh toán
                      </button>
                    </div>
                  )}
                </div>

                <div className="ticket-grid">
                  {group.map((ticket) => (
                    <div className="ticket-card" key={ticket._id} style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div className="ticket-status">
                        {ticket.status === "cancelled" ? "Đã hủy" : "Đã đặt"}
                      </div>

                      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{ticket.train?.name || ticket.train?.flightNumber || "Chuyến bay"}</h3>

                      <p>
                        <strong>Mã vé:</strong> <span style={{ fontWeight: "bold", color: "#007bff" }}>#{String(ticket._id).slice(-6).toUpperCase()}</span>
                      </p>

                      <div style={{ background: '#f5f9ff', padding: '10px', borderRadius: '6px', margin: '10px 0', border: '1px dashed #bee5eb' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#0c5460' }}>
                          <strong>👤 KH:</strong> {ticket.passengerName || "Trống"}
                        </p>
                        <p style={{ margin: '0', color: '#0c5460', fontSize: '13px' }}>
                          <strong>CCCD:</strong> {ticket.cccd || "Trống"} | <strong>Loại:</strong> {ticket.passengerType === 'child' ? 'Trẻ em' : ticket.passengerType === 'student' ? 'Sinh viên' : ticket.passengerType === 'senior' ? 'Người cao tuổi' : 'Người lớn'}
                        </p>
                      </div>

                      <p>
                        <strong>Tuyến:</strong> {ticket.train?.from} → {ticket.train?.to}
                      </p>

                      <p>
                        <strong>Vị trí:</strong> Khoang {ticket.coachNumber} - Chỗ {ticket.seatNumber}
                      </p>

                      <p>
                        <strong>Khởi hành:</strong>{" "}
                        {ticket.train?.departureTime || "Chưa có"} - {ticket.train?.departureDate ? new Date(ticket.train.departureDate).toLocaleDateString("vi-VN") : "Chưa có"}
                      </p>

                      {ticket.discountAmount > 0 ? (
                        <div style={{ marginBottom: "10px", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px dashed #ccc" }}>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Giá gốc:</strong>{" "}
                            <span style={{ textDecoration: "line-through", color: "#888" }}>
                              {(ticket.originalPrice || ticket.train?.price || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </p>
                          <p style={{ margin: "4px 0", color: "#28a745" }}>
                            <strong>Giảm giá:</strong> -{(ticket.discountAmount).toLocaleString("vi-VN")}đ
                            {ticket.promotionCode && (
                              <span style={{ backgroundColor: "#28a745", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", marginLeft: "6px" }}>
                                {ticket.promotionCode}
                              </span>
                            )}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Thành tiền:</strong>{" "}
                            <span style={{ color: "#d9534f", fontWeight: "bold", fontSize: "1.1em" }}>
                              {(ticket.price || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p>
                          <strong>Giá vé:</strong>{" "}
                          <span style={{ color: "#d9534f", fontWeight: "bold", fontSize: "1.1em" }}>
                            {(ticket.price || ticket.train?.price || 0).toLocaleString("vi-VN")}đ
                          </span>
                        </p>
                      )}

                      <p style={{ marginTop: '10px' }}>
                        <strong>TT:</strong> {renderPaymentText(ticket)}
                      </p>

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
                            Thanh toán lẻ
                          </button>
                        )}

                        {ticket.status !== "cancelled" && ticket.paymentStatus === "paid" && (
                          <button
                            className="cancel-btn"
                            style={{ background: "#c9503a", color: "#fff", border: "none" }}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            🎟️ Xem vé điện tử
                          </button>
                        )}

                        {ticket.status !== "cancelled" && (
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelClick(ticket)}
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

      {/* Tích hợp Modal sinh E-Ticket */}
      {selectedTicket && (
        <TicketQRCode
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Tích hợp Modal Xác nhận hủy vé Đẹp */}
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
