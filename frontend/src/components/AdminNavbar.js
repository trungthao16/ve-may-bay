import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function AdminNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const activeClass = ({ isActive }) => (isActive ? "active" : "");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-inner">
        <div className="admin-navbar-left">
          <div className="admin-brand" onClick={() => navigate("/admin")}>
            <div className="rv-brand-icon">✈️</div>
            <div className="admin-brand-text">
              <h2>VeMayBayOnline</h2>
              <span>Quản trị hệ thống</span>
            </div>
          </div>

          <nav className="admin-menu">
            <NavLink to="/admin" end className={activeClass}>
              Dashboard
            </NavLink>

            <NavLink to="/admin/flights" className={activeClass}>
              Quản lý chuyến bay
            </NavLink>

            <NavLink to="/admin/tickets" className={activeClass}>
              Quản lý vé
            </NavLink>

            <NavLink to="/admin/users" className={activeClass}>
              Quản lý user
            </NavLink>

            <NavLink to="/admin/promotions" className={activeClass}>
              Khuyến mãi
            </NavLink>

            <NavLink to="/admin/support" className={activeClass}>
              Hỗ trợ
            </NavLink>
          </nav>
        </div>

        <div className="admin-navbar-right">
          <div className="rv-user-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="rv-user-box"
              onClick={() => setOpenUserMenu(!openUserMenu)}
            >
              <div className="rv-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>

              <div className="rv-user-info">
                <strong>{user?.name || "Admin"}</strong>
                <span>{user?.email || "admin@email.com"}</span>
              </div>

              <div className="rv-user-caret">▾</div>
            </button>

            {openUserMenu && (
              <div className="rv-user-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setOpenUserMenu(false);
                  }}
                >
                  Thông tin cá nhân
                </button>

                {/* <button
                  type="button"
                  onClick={() => {
                    navigate("/profile/edit");
                    setOpenUserMenu(false);
                  }}
                >
                  Chỉnh sửa thông tin
                </button> */}

                <button
                  type="button"
                  onClick={() => {
                    navigate("/");
                    setOpenUserMenu(false);
                  }}
                >
                  Về trang chủ
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    setOpenUserMenu(false);
                    logout();
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
