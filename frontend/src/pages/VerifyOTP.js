import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Lỗi</h1>
          <p>Không tìm thấy địa chỉ email để xác thực. Vui lòng đăng ký lại.</p>
          <button className="auth-btn" onClick={() => navigate("/register")}>
            Quay lại Đăng ký
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      const res = await API.post("/auth/verify-otp", { email, otpCode });
      setMessage(res.data.message);
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError("");
      setMessage("");
      
      const res = await API.post("/auth/resend-otp", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi lại mã OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '400px' }}>
        <p className="section-label">Bảo mật tài khoản</p>
        <h1>Xác Thực Email</h1>
        <p className="auth-sub">
          Chúng tôi đã gửi một mã OTP gồm 6 chữ số đến email <br/>
          <strong>{email}</strong>
        </p>

        {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
        {error && <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleVerify} className="auth-form">
          <label>Nhập mã OTP</label>
          <input
            type="text"
            placeholder="VD: 123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength="6"
            style={{ fontSize: '24px', letterSpacing: '5px', textAlign: 'center' }}
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác Thực"}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '20px' }}>
          Chưa nhận được mã?{" "}
          <button 
            type="button" 
            onClick={handleResend} 
            disabled={resendLoading}
            style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            {resendLoading ? "Đang gửi..." : "Gửi lại mã"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOTP;
