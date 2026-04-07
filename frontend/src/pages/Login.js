import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Đăng nhập thành công!");

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      window.location.reload();
    } catch (error) {
      console.log(error);
      if (error.response?.data?.notVerified) {
        alert("Tài khoản chưa được xác thực. Đang chuyển hướng...");
        navigate(`/verify-otp?email=${encodeURIComponent(error.response.data.email || form.email)}`);
      } else {
        alert(error.response?.data?.message || "Email hoặc mật khẩu không đúng.");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="section-label">Tài khoản</p>
        <h1>Đăng nhập</h1>
        <p className="auth-sub">Đăng nhập để đặt vé và quản lý vé của bạn.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">
            Đăng nhập
          </button>
        </form>

        <p className="auth-footer">
          Quên mật khẩu? <Link to="/forgot-password">Lấy lại mật khẩu</Link>
        </p>
        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;