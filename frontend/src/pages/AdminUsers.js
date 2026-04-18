import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      toast.error("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    if (!window.confirm(`Đổi quyền thành ${newRole}?`)) return;

    try {
      await API.put(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error("Lỗi đổi quyền:", error);
      toast.error("Đổi quyền thất bại");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi xóa user:", error);
      toast.error("Xóa người dùng thất bại");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="admin-page">
      <div className="rv-container">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Quản lý người dùng</h1>
          <p className="admin-page-sub">
            Quản lý tài khoản, phân quyền admin/user và xóa người dùng.
          </p>
        </div>

        <div className="admin-stat-row">
          <div className="admin-stat-card">
            <span>Tổng người dùng</span>
            <strong>{totalUsers}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Admin</span>
            <strong>{adminCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span>User</span>
            <strong>{userCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Kết quả lọc</span>
            <strong>{filteredUsers.length}</strong>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-toolbar">
            <div className="admin-toolbar-left">
              <input
                type="text"
                className="admin-search"
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-toolbar-right">
              <select
                className="admin-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả quyền</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-box">Đang tải dữ liệu người dùng...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty-box">Không có người dùng nào phù hợp.</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Quyền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="admin-user-info">
                            <strong>{user.name}</strong>
                            <span>ID: {user._id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className={`admin-badge ${user.role === "admin" ? "admin" : "user"}`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="admin-actions-cell">
                        <div className="admin-actions">
                          <button
                            className="admin-btn role"
                            onClick={() => handleChangeRole(user._id, user.role)}
                          >
                            Đổi quyền
                          </button>

                          <button
                            className="admin-btn delete"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
