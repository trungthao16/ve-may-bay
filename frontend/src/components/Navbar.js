// import { NavLink, useNavigate } from "react-router-dom";

// function Navbar() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//     window.location.reload();
//   };

//   return (
//     <header className="rv-navbar">
//       <div className="rv-container rv-navbar-inner">
//         <div className="rv-brand" onClick={() => navigate("/")}>
//           <div className="rv-brand-icon">🚆</div>
//           <span>VeTauOnline</span>
//         </div>

//         <nav className="rv-menu">
//           <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
//             Trang chủ
//           </NavLink>

//           <NavLink to="/trains" className={({ isActive }) => (isActive ? "active" : "")}>
//             Tra cứu vé
//           </NavLink>

//           <NavLink to="/promotions" className={({ isActive }) => (isActive ? "active" : "")}>
//             Khuyến mãi
//           </NavLink>

//           <NavLink to="/support" className={({ isActive }) => (isActive ? "active" : "")}>
//             Hỗ trợ
//           </NavLink>
//         </nav>

//         <div className="rv-navbar-actions">
//           {user ? (
//             <>
//               <NavLink to="/mytickets" className="rv-login-btn ghost-btn">
//                 Vé của tôi
//               </NavLink>

//               <button className="rv-login-btn" onClick={logout}>
//                 Đăng xuất
//               </button>
//             </>
//           ) : (
//             <NavLink to="/login" className="rv-login-btn">
//               Đăng nhập
//             </NavLink>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Navbar;

import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="rv-navbar">
      <div className="rv-container rv-navbar-inner">
        <div className="rv-brand" onClick={() => navigate("/")}>
          <div className="rv-brand-icon">🚆</div>
          <span>VeTauOnline</span>
        </div>

        <nav className="rv-menu">
          <NavLink to="/" end>
            Trang chủ
          </NavLink>

          <NavLink to="/trains">
            Tra cứu vé
          </NavLink>

          <NavLink to="/promotions">
            Khuyến mãi
          </NavLink>

          <NavLink to="/support">
            Hỗ trợ
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin">
              Quản trị
            </NavLink>
          )}
        </nav>

        <div className="rv-navbar-actions">
          {user ? (
            <>
              <NavLink to="/mytickets" className="rv-login-btn ghost-btn">
                Vé của tôi
              </NavLink>

              {/* 🔥 THÊM DÒNG NÀY */}
              <NavLink to="/profile" className="rv-login-btn ghost-btn">
                Cá nhân
              </NavLink>

              {user?.role === "admin" && (
                <NavLink to="/admin" className="rv-login-btn rv-admin-back-btn">
                  Vào admin
                </NavLink>
              )}

              <button className="rv-login-btn" onClick={logout}>
                Đăng xuất
              </button>
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