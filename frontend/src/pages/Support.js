import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMySupports();
  }, []);

  const fetchMySupports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/support/my");
      setSupports(res.data || []);
    } catch (error) {
      console.error("Lỗi tải hỗ trợ:", error);
      setSupports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/support", {
        subject,
        message,
      });

      setSubject("");
      setMessage("");
      await fetchMySupports();
      toast.success("Gửi yêu cầu hỗ trợ thành công");
    } catch (error) {
      console.error("Lỗi gửi hỗ trợ:", error);
      toast.error(error.response?.data?.message || "Gửi yêu cầu hỗ trợ thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    if (status === "pending") return "Chờ xử lý";
    if (status === "in_progress") return "Đang xử lý";
    if (status === "resolved") return "Đã giải quyết";
    return status;
  };

  return (
    <div className="support-page">
      <div className="rv-container">
        <div className="support-header">
          <h1 className="support-title">Hỗ trợ</h1>
          <p className="support-sub">
            Gửi yêu cầu và theo dõi phản hồi từ hệ thống
          </p>
        </div>

        <div className="support-layout">
          <div className="support-form-card">
            <h3>Gửi yêu cầu</h3>

            <form onSubmit={handleSubmit}>
              <div className="support-form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề hỗ trợ"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="support-form-group">
                <label>Nội dung</label>
                <textarea
                  placeholder="Mô tả vấn đề bạn đang gặp phải..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="support-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi hỗ trợ"}
              </button>
            </form>
          </div>

          <div className="support-list-card">
            <h3>Yêu cầu của tôi</h3>

            {loading ? (
              <div className="support-empty">Đang tải danh sách yêu cầu...</div>
            ) : supports.length === 0 ? (
              <div className="support-empty">
                Bạn chưa gửi yêu cầu hỗ trợ nào.
              </div>
            ) : (
              <div className="support-ticket-list">
                {supports.map((item) => (
                  <div className="support-ticket" key={item._id}>
                    <div className="support-ticket-top">
                      <h4 className="support-ticket-subject">{item.subject}</h4>
                      <span className={`support-status ${item.status}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>

                    <p className="support-ticket-message">{item.message}</p>

                    <div className="support-reply-box">
                      <strong>Phản hồi từ admin</strong>
                      {item.reply?.trim()
                        ? item.reply
                        : "Chưa có phản hồi từ quản trị viên"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
