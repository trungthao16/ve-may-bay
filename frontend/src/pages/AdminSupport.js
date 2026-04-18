import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function AdminSupport() {
  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState({});
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    fetchSupports();
  }, []);

  const fetchSupports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/support/admin");
      const list = res.data || [];
      setSupports(list);

      const initReplyMap = {};
      const initStatusMap = {};

      list.forEach((item) => {
        initReplyMap[item._id] = item.reply || "";
        initStatusMap[item._id] = item.status || "pending";
      });

      setReplyMap(initReplyMap);
      setStatusMap(initStatusMap);
    } catch (error) {
      console.error("Lỗi tải hỗ trợ admin:", error);
      setSupports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    try {
      await API.put(`/support/${id}/reply`, {
        reply: replyMap[id] || "",
        status: statusMap[id] || "pending",
      });

      toast.success("Phản hồi hỗ trợ thành công");
      fetchSupports();
    } catch (error) {
      console.error("Lỗi phản hồi hỗ trợ:", error);
      toast.error(error.response?.data?.message || "Phản hồi thất bại");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa yêu cầu hỗ trợ này?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/support/${id}`);
      toast.success("Xóa yêu cầu hỗ trợ thành công");
      fetchSupports();
    } catch (error) {
      console.error("Lỗi xóa hỗ trợ:", error);
      toast.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  const getStatusText = (status) => {
    if (status === "pending") return "Chờ xử lý";
    if (status === "in_progress") return "Đang xử lý";
    if (status === "resolved") return "Đã giải quyết";
    return status;
  };

  return (
    <div className="admin-support-page">
      <div className="rv-container">
        <div className="support-header">
          <h1 className="support-title">Quản lý hỗ trợ</h1>
          <p className="support-sub">
            Theo dõi, phản hồi và xử lý yêu cầu hỗ trợ từ người dùng
          </p>
        </div>

        {loading ? (
          <div className="promotion-empty">Đang tải danh sách hỗ trợ...</div>
        ) : supports.length === 0 ? (
          <div className="promotion-empty">Chưa có yêu cầu hỗ trợ nào.</div>
        ) : (
          <div className="admin-support-list">
            {supports.map((item) => (
              <div className="admin-support-item" key={item._id}>
                <div className="admin-support-head">
                  <div>
                    <h3>{item.subject}</h3>
                    <div className="admin-support-user">
                      {item.user?.name || "Không rõ tên"} -{" "}
                      {item.user?.email || "Không rõ email"}
                    </div>
                  </div>

                  <span className={`support-status ${item.status}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>

                <p className="admin-support-message">{item.message}</p>

                <div className="admin-support-reply">
                  <textarea
                    placeholder="Nhập phản hồi cho người dùng..."
                    value={replyMap[item._id] || ""}
                    onChange={(e) =>
                      setReplyMap((prev) => ({
                        ...prev,
                        [item._id]: e.target.value,
                      }))
                    }
                  />

                  <select
                    value={statusMap[item._id] || "pending"}
                    onChange={(e) =>
                      setStatusMap((prev) => ({
                        ...prev,
                        [item._id]: e.target.value,
                      }))
                    }
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                  </select>

                  <div className="admin-support-actions">
                    <button
                      className="admin-save-btn"
                      onClick={() => handleReply(item._id)}
                    >
                      Gửi phản hồi
                    </button>

                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSupport;
