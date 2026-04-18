import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function EditProfile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...currentUser,
      name,
      email,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Cập nhật thông tin thành công!");
    navigate("/profile");
    window.location.reload();
  };

  return (
    <div className="rv-container" style={{ padding: "40px 0 80px" }}>
      <div className="admin-card">
        <h1 className="admin-page-title" style={{ fontSize: "42px", marginBottom: "24px" }}>
          Chỉnh sửa thông tin
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Họ tên
            </label>
            <input
              type="text"
              className="admin-search"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              className="admin-search"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="submit" className="rv-login-btn">
              Lưu thay đổi
            </button>

            <button
              type="button"
              className="admin-home-btn"
              onClick={() => navigate("/profile")}
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
