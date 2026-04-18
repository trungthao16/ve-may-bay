import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    flightNumber: "",
    from: "",
    to: "",
    departureDate: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    totalSeats: "",
  });

  const fetchFlights = async () => {
    try {
      const res = await API.get("/flights");
      setFlights(res.data);
    } catch (error) {
      console.log("FETCH ERROR:", error);
      console.log("FETCH DATA:", error.response?.data);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      flightNumber: "",
      from: "",
      to: "",
      departureDate: "",
      departureTime: "",
      arrivalTime: "",
      price: "",
      totalSeats: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/flights/${editingId}`, form);
        toast.success("Cập nhật chuyến bay thành công");
      } else {
        await API.post("/flights", form);
        toast.success("Thêm chuyến bay thành công");
      }

      resetForm();
      fetchFlights();
    } catch (error) {
      console.log("SUBMIT ERROR:", error);
      console.log("SUBMIT RESPONSE:", error.response);
      console.log("SUBMIT DATA:", error.response?.data);

      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (flight) => {
    setEditingId(flight._id);
    setForm({
      flightNumber: flight.flightNumber || "",
      from: flight.from || "",
      to: flight.to || "",
      departureDate: flight.departureDate
        ? flight.departureDate.slice(0, 10)
        : "",
      departureTime: flight.departureTime || "",
      arrivalTime: flight.arrivalTime || "",
      price: flight.price || "",
      totalSeats: flight.totalSeats || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa chuyến bay này?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/flights/${id}`);
      toast.success("Xóa chuyến bay thành công");
      fetchFlights();
    } catch (error) {
      console.log("DELETE ERROR:", error);
      console.log("DELETE DATA:", error.response?.data);
      toast.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="admin-page">
      <div className="rv-container">
        <div className="admin-page-header">
        <p className="section-label">Quản trị hệ thống</p>
          <h1 className="admin-page-title">Quản lý chuyến bay</h1>
          <p className="admin-page-sub">Quản trị các chặng bay và lịch trình bay trong hệ thống</p>
        </div>

      <div className="train-card admin-form-card">
        <h3 className="admin-form-title">
          {editingId ? "Sửa chuyến bay" : "Thêm chuyến bay"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <input
              type="text"
              name="flightNumber"
              placeholder="Mã chuyến bay (VD: VN123)"
              value={form.flightNumber}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="from"
              placeholder="Sân bay đi"
              value={form.from}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="to"
              placeholder="Sân bay đến"
              value={form.to}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="departureDate"
              value={form.departureDate}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="departureTime"
              placeholder="Giờ khởi hành"
              onFocus={(e) => (e.target.type = "time")}
              onBlur={(e) => (e.target.type = "text")}
              value={form.departureTime}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="arrivalTime"
              placeholder="Giờ đến"
              onFocus={(e) => (e.target.type = "time")}
              onBlur={(e) => (e.target.type = "text")}
              value={form.arrivalTime}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Giá vé"
              value={form.price}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="totalSeats"
              placeholder="Tổng số chỗ"
              value={form.totalSeats}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="book-btn admin-main-btn">
              {editingId ? "Cập nhật" : "Thêm chuyến bay"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn admin-cancel-btn"
                onClick={resetForm}
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã chuyến bay</th>
                <th>Sân bay đi</th>
                <th>Sân bay đến</th>
                <th>Ngày khởi hành</th>
                <th>Giá</th>
                <th>Giờ đi</th>
                <th>Giờ đến</th>
                <th>Chỗ</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {flights.length > 0 ? (
                flights.map((flight) => (
                  <tr key={flight._id}>
                    <td>{flight.flightNumber}</td>
                    <td>{flight.from}</td>
                    <td>{flight.to}</td>
                    <td>
                      {flight.departureDate
                        ? new Date(flight.departureDate).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </td>
                    <td>{Number(flight.price).toLocaleString("vi-VN")}đ</td>
                    <td>{flight.departureTime}</td>
                    <td>{flight.arrivalTime}</td>
                    <td>{flight.totalSeats}</td>
                    <td className="admin-actions-cell">
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(flight)}
                          className="admin-btn role"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(flight._id)}
                          className="admin-btn delete"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="admin-empty">
                    Chưa có chuyến bay nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
}

export default AdminFlights;
