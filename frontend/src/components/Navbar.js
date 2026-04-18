import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
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
    <header className="rv-navbar">
      <div className="rv-container rv-navbar-inner">
        <div className="rv-brand" onClick={() => navigate("/")}>
          <div className="rv-brand-icon">✈️</div>
          <span>VeMayBayOnline</span>
        </div>

        <nav className="rv-menu">
          <NavLink to="/" end className={activeClass}>
            Trang chủ
          </NavLink>

          <NavLink to="/flights" className={activeClass}>
            Chuyến bay
          </NavLink>

          <NavLink to="/promotions" className={activeClass}>
            Khuyến mãi
          </NavLink>

          <NavLink to="/support" className={activeClass}>
            Hỗ trợ
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" className={activeClass}>
              Quản trị
            </NavLink>
          )}
        </nav>

        <div className="rv-navbar-actions">
          {user ? (
            <>
              {user?.role !== "admin" && (
                <NavLink to="/mytickets" className="rv-login-btn ghost-btn">
                  Vé của tôi
                </NavLink>
              )}

              {/* {user?.role === "admin" && (
                <NavLink to="/admin" className="rv-login-btn rv-admin-back-btn">
                  Vào admin
                </NavLink>
              )} */}

              <div className="rv-user-menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className="rv-user-box"
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                >
                  <div className="rv-user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="rv-user-info">
                    <strong>{user?.name || "Người dùng"}</strong>
                    <span>{user?.email || "user@email.com"}</span>
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
            </>
          ) : (
            <NavLink to="/login" className="rv-login-btn">
              Đăng nhập
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
