import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tickets");
      setTickets(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách vé:", error);
      toast.error("Không tải được danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy vé này?")) return;

    try {
      await API.put(`/tickets/${id}/cancel`);
      fetchTickets();
    } catch (error) {
      console.error("Lỗi hủy vé:", error);
      toast.error(error.response?.data?.message || "Hủy vé thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vé này?")) return;

    try {
      await API.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (error) {
      console.error("Lỗi xóa vé:", error);
      toast.error(error.response?.data?.message || "Xóa vé thất bại");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const customerName = ticket.user?.name || "";
      const customerEmail = ticket.user?.email || "";
      const route =
        ticket.train
          ? `${ticket.train.from || ""} ${ticket.train.to || ""}`
          : `${ticket.from || ""} ${ticket.to || ""}`;

      const matchesSearch =
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        route.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const totalTickets = tickets.length;
  const bookedCount = tickets.filter((t) => t.status === "booked").length;
  const cancelledCount = tickets.filter((t) => t.status === "cancelled").length;

  // chỉ tính doanh thu từ vé đã thanh toán
  const totalRevenue = tickets
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + (t.price ?? t.train?.price ?? 0), 0);

  const renderTicketStatus = (status) => {
    if (status === "cancelled") return "Đã hủy";
    return "Đã đặt";
  };

  const renderPaymentStatus = (paymentStatus) => {
    if (paymentStatus === "paid") return "Đã thanh toán";
    if (paymentStatus === "failed") return "Thanh toán lỗi";
    return "Chưa thanh toán";
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    if (paymentStatus === "paid") return "paid";
    if (paymentStatus === "failed") return "failed";
    return "unpaid";
  };

  return (
    <div className="admin-page">
      <div className="rv-container">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Quản lý vé</h1>
          <p className="admin-page-sub">
            Theo dõi danh sách vé, trạng thái đặt vé và thao tác quản trị.
          </p>
        </div>

        <div className="admin-stat-row">
          <div className="admin-stat-card">
            <span>Tổng vé</span>
            <strong>{totalTickets}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Đã đặt</span>
            <strong>{bookedCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Đã hủy</span>
            <strong>{cancelledCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Doanh thu đã thanh toán</span>
            <strong>{totalRevenue.toLocaleString("vi-VN")} VNĐ</strong>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-toolbar">
            <div className="admin-toolbar-left">
              <input
                type="text"
                className="admin-search"
                placeholder="Tìm theo khách hàng, email, tuyến..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-toolbar-right">
              <select
                className="admin-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-box">Đang tải dữ liệu vé...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="admin-empty-box">Không có vé nào phù hợp.</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Mã Vé & Ngày Đặt</th>
                    <th>Chuyến tàu & Hành trình</th>
                    <th>Ghế</th>
                    <th>Giá (VND)</th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const name = ticket.user?.name || "Không rõ";
                    const email = ticket.user?.email || "Chưa có email";
                    const trainName =
                      ticket.train?.name || ticket.train?.trainName || "Chưa có";
                    const from = ticket.train?.from || ticket.from || "N/A";
                    const to = ticket.train?.to || ticket.to || "N/A";
                    const price = ticket.price ?? ticket.train?.price ?? 0;
                    const originalPrice = ticket.originalPrice ?? ticket.train?.price ?? 0;
                    const status = ticket.status || "booked";
                    const paymentStatus = ticket.paymentStatus || "unpaid";

                    return (
                      <tr key={ticket._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="admin-user-info">
                              <strong>{name}</strong>
                              <span>{email}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-ticket-id-box">
                            <span className="admin-id-link">#{String(ticket._id).slice(-6).toUpperCase()}</span>
                            <span className="admin-ticket-date">
                              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-trip-info">
                            <div className="admin-trip-route">{from} ➔ {to}</div>
                            <div className="admin-trip-sub">{trainName}</div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: "700", color: "#475569" }}>{ticket.seatNumber || "—"}</div>
                        </td>

                        <td>
                          <div className="admin-price-cell">
                            {ticket.discountAmount > 0 && (
                              <span className="admin-price-original">
                                {Number(originalPrice).toLocaleString("vi-VN")}
                              </span>
                            )}
                            <span className="admin-price-main">
                              {Number(price).toLocaleString("vi-VN")}
                            </span>
                            {ticket.discountAmount > 0 && (
                              <span className="admin-saving-tag">
                                Tiết kiệm: -{Number(ticket.discountAmount).toLocaleString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className={`admin-badge ${status === "cancelled" ? "cancelled" : "booked"}`}>
                            {renderTicketStatus(status)}
                          </span>
                        </td>

                        <td>
                          <div className="admin-payment-info">
                            <span className={`admin-badge payment ${getPaymentBadgeClass(paymentStatus)}`}>
                              {renderPaymentStatus(paymentStatus)}
                            </span>
                            {ticket.paidAt && (
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                {new Date(ticket.paidAt).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                            {ticket.vnpTxnRef && paymentStatus === "paid" && (
                              <span className="admin-txn-ref" title={ticket.vnpTxnRef}>
                                Ref: {ticket.vnpTxnRef}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="admin-actions-h">
                            {status !== "cancelled" && (
                              <button
                                className="admin-btn-icon cancel"
                                title="Hủy vé"
                                onClick={() => handleCancel(ticket._id)}
                              >
                                🚫
                              </button>
                            )}
                            <button
                              className="admin-btn-icon delete"
                              title="Xóa vé"
                              onClick={() => handleDelete(ticket._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTickets;