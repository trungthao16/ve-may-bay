import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await API.post("/auth/register", form);
      // Chuyển hướng tới trang nhập OTP
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="section-label">Tạo tài khoản</p>
        <h1>Đăng ký</h1>
        <p className="auth-sub">Tạo tài khoản để bắt đầu đặt vé tàu.</p>

        <form onSubmit={handleRegister} className="auth-form">
          <label>Họ và tên</label>
          <input
            type="text"
            name="name"
            placeholder="Nhập họ và tên"
            value={form.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={handleChange}
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;