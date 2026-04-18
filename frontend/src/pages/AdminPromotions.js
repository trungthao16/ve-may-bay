import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const initialForm = {
  code: "",
  title: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/promotions/admin");
      setPromotions(res.data || []);
    } catch (error) {
      console.error("Lỗi tải khuyến mãi admin:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      code: item.code || "",
      title: item.title || "",
      description: item.description || "",
      discountType: item.discountType || "percent",
      discountValue: item.discountValue ?? "",
      minOrderValue: item.minOrderValue ?? "",
      maxDiscount: item.maxDiscount ?? "",
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      isActive: item.isActive ?? true,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.title || !form.discountValue || !form.startDate || !form.endDate) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc");
      return;
    }

    const payload = {
      ...form,
      discountValue: Number(form.discountValue || 0),
      minOrderValue: Number(form.minOrderValue || 0),
      maxDiscount: Number(form.maxDiscount || 0),
    };

    try {
      setSaving(true);

      if (editingId) {
        await API.put(`/promotions/${editingId}`, payload);
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await API.post("/promotions", payload);
        toast.success("Thêm khuyến mãi thành công");
      }

      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error("Lỗi lưu khuyến mãi:", error);
      toast.error(error.response?.data?.message || "Lưu khuyến mãi thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa khuyến mãi này?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/promotions/${id}`);
      toast.success("Xóa khuyến mãi thành công");
      fetchPromotions();
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      toast.error(error.response?.data?.message || "Xóa khuyến mãi thất bại");
    }
  };

  const formatDiscount = (item) => {
    if (item.discountType === "percent") return `${item.discountValue}%`;
    return `${Number(item.discountValue || 0).toLocaleString("vi-VN")} VNĐ`;
  };

  const formatDate = (date) => {
    if (!date) return "Không xác định";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="admin-promotions-page">
      <div className="rv-container">
        <div className="admin-promotions-layout">
          <div className="admin-panel-card">
            <h2>{editingId ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}</h2>

            <form className="admin-promotion-form" onSubmit={handleSubmit}>
              <div className="admin-promotion-grid">
                <input
                  type="text"
                  name="code"
                  placeholder="Mã khuyến mãi"
                  value={form.code}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="title"
                  placeholder="Tiêu đề khuyến mãi"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <textarea
                name="description"
                placeholder="Mô tả chương trình"
                value={form.description}
                onChange={handleChange}
              />

              <div className="admin-promotion-grid">
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                >
                  <option value="percent">Giảm theo %</option>
                  <option value="fixed">Giảm tiền cố định</option>
                </select>

                <input
                  type="number"
                  name="discountValue"
                  placeholder="Giá trị giảm"
                  value={form.discountValue}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-promotion-grid">
                <input
                  type="number"
                  name="minOrderValue"
                  placeholder="Đơn tối thiểu"
                  value={form.minOrderValue}
                  onChange={handleChange}
                />

                <input
                  type="number"
                  name="maxDiscount"
                  placeholder="Giảm tối đa"
                  value={form.maxDiscount}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-promotion-grid">
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  style={{ width: 18, height: 18 }}
                />
                Kích hoạt khuyến mãi
              </label>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="submit" className="admin-save-btn" disabled={saving}>
                  {saving
                    ? "Đang lưu..."
                    : editingId
                    ? "Cập nhật khuyến mãi"
                    : "Lưu khuyến mãi"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={resetForm}
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-panel-card">
            <h2>Danh sách khuyến mãi</h2>

            {loading ? (
              <div className="promotion-empty">Đang tải dữ liệu...</div>
            ) : promotions.length === 0 ? (
              <div className="promotion-empty">Chưa có khuyến mãi nào.</div>
            ) : (
              <div className="admin-promotion-list">
                {promotions.map((item) => (
                  <div className="admin-promotion-item" key={item._id}>
                    <div className="admin-promotion-item-top">
                      <div>
                        <h4>{item.title}</h4>
                        <p>
                          <strong>Mã:</strong> {item.code}
                        </p>
                      </div>

                      <span
                        className={`admin-toggle-badge ${
                          item.isActive ? "active" : "inactive"
                        }`}
                      >
                        {item.isActive ? "Đang bật" : "Đang tắt"}
                      </span>
                    </div>

                    <p>
                      <strong>Mô tả:</strong>{" "}
                      {item.description || "Chưa có mô tả"}
                    </p>
                    <p>
                      <strong>Giảm giá:</strong> {formatDiscount(item)}
                    </p>
                    <p>
                      <strong>Đơn tối thiểu:</strong>{" "}
                      {Number(item.minOrderValue || 0).toLocaleString("vi-VN")} VNĐ
                    </p>
                    <p>
                      <strong>Giảm tối đa:</strong>{" "}
                      {item.maxDiscount
                        ? `${Number(item.maxDiscount).toLocaleString("vi-VN")} VNĐ`
                        : "Không giới hạn"}
                    </p>
                    <p>
                      <strong>Thời gian:</strong> {formatDate(item.startDate)} -{" "}
                      {formatDate(item.endDate)}
                    </p>

                    <div className="admin-promotion-actions">
                      <button
                        className="admin-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(item._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPromotions;
