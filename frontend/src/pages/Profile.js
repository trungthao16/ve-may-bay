import { useState, useEffect } from "react";
import API from "../api/axios";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    // lấy user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put("/users/profile", form);

      setMessage("Cập nhật thành công!");

      // cập nhật lại localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
  console.log(err.response);
  setMessage(err.response?.data?.message || "Lỗi cập nhật!");
}
  };

  return (
  <div className="profile-page">
    <div className="profile-card">
      <h1 className="profile-title">Cập nhật thông tin</h1>

      {message && <div className="profile-message">{message}</div>}

      <form className="profile-form" onSubmit={handleUpdate}>
        <div className="profile-field">
          <label>Họ tên</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="profile-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="profile-field">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            name="password"
            placeholder="Để trống nếu không đổi"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="profile-actions">
          <button type="submit" className="profile-btn">
            Cập nhật
          </button>

          <button
            type="button"
            className="profile-btn secondary"
            onClick={() => window.history.back()}
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

export default Profile;
