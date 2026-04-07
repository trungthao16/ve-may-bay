import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

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
      alert("Không tải được danh sách vé");
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
      alert(error.response?.data?.message || "Hủy vé thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vé này?")) return;

    try {
      await API.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (error) {
      console.error("Lỗi xóa vé:", error);
      alert(error.response?.data?.message || "Xóa vé thất bại");
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
                    <th>Tàu</th>
                    <th>Tuyến</th>
                    <th>Ghế</th>
                    <th>Giá (VND)</th>
                    <th>Trạng thái vé</th>
                    <th>Thanh toán</th>
                    <th>Phương thức</th>
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
                    const paymentMethod = ticket.paymentMethod || "vnpay";

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
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <strong style={{ color: "#007bff" }}>#{String(ticket._id).slice(-6).toUpperCase()}</strong>
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                            </span>
                          </div>
                        </td>

                        <td>{trainName}</td>

                        <td>
                          <div className="admin-route-box">
                            <strong>
                              {from} → {to}
                            </strong>
                            <span>Hành trình vé</span>
                          </div>
                        </td>

                        <td>{ticket.seatNumber || "—"}</td>

                        <td>
                          {ticket.discountAmount > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ textDecoration: "line-through", color: "#888", fontSize: "12px" }}>
                                {Number(originalPrice).toLocaleString("vi-VN")}
                              </span>
                              <strong className="admin-price" style={{ margin: 0, padding: 0 }}>
                                {Number(price).toLocaleString("vi-VN")}
                              </strong>
                              <span style={{ backgroundColor: "#28a745", color: "white", padding: "2px 4px", borderRadius: "4px", fontSize: "10px", width: "fit-content" }}>
                                Khuyến mãi: -{Number(ticket.discountAmount).toLocaleString("vi-VN")}
                              </span>
                            </div>
                          ) : (
                            <strong className="admin-price">{Number(price).toLocaleString("vi-VN")}</strong>
                          )}
                        </td>

                        <td>
                          <span
                            className={`admin-badge ${status === "cancelled" ? "cancelled" : "booked"
                              }`}
                          >
                            {renderTicketStatus(status)}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              className={`admin-badge payment ${getPaymentBadgeClass(
                                paymentStatus
                              )}`}
                              style={{ width: "fit-content" }}
                            >
                              {renderPaymentStatus(paymentStatus)}
                            </span>
                            {ticket.paidAt && (
                              <span style={{ fontSize: "11px", color: "#555" }}>
                                HD: {new Date(ticket.paidAt).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                            {ticket.vnpTxnRef && paymentStatus === "paid" && (
                              <span style={{ fontSize: "11px", color: "#666", wordBreak: "break-all" }}>
                                Mã GD: {ticket.vnpTxnRef}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>{paymentMethod}</td>

                        <td>
                          <div className="admin-actions">
                            {status !== "cancelled" && (
                              <button
                                className="admin-btn cancel"
                                onClick={() => handleCancel(ticket._id)}
                              >
                                Hủy vé
                              </button>
                            )}

                            <button
                              className="admin-btn delete"
                              onClick={() => handleDelete(ticket._id)}
                            >
                              Xóa
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