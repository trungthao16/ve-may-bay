import { useEffect, useState } from "react";
import API from "../api/axios";

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/promotions");
      setPromotions(res.data || []);
    } catch (error) {
      console.error("Lỗi tải khuyến mãi:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (item) => {
    if (item.discountType === "percent") {
      return `${item.discountValue}%`;
    }
    return `${Number(item.discountValue || 0).toLocaleString("vi-VN")} VNĐ`;
  };

  const formatDate = (date) => {
    if (!date) return "Không xác định";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="promotions-page">
      <div className="rv-container">
        <div className="promotions-header">
          <h1 className="promotions-title">Khuyến mãi</h1>
          <p className="promotions-sub">
            Cập nhật những ưu đãi mới nhất cho hành trình bay của bạn
          </p>
        </div>

        {loading ? (
          <div className="promotion-empty">Đang tải danh sách khuyến mãi...</div>
        ) : promotions.length === 0 ? (
          <div className="promotion-empty">
            Hiện chưa có chương trình khuyến mãi nào đang hoạt động.
          </div>
        ) : (
          <div className="promotions-grid">
            {promotions.map((item) => (
              <div className="promotion-card" key={item._id}>
                <span className="promotion-badge">Ưu đãi hot</span>

                <h3>{item.title}</h3>

                <div className="promotion-code">
                  Mã: {item.code || "Không có mã"}
                </div>

                <p className="promotion-desc">
                  {item.description || "Chưa có mô tả cho chương trình này."}
                </p>

                <div className="promotion-meta">
                  <div>
                    <span>Giảm giá</span>
                    <strong>{formatDiscount(item)}</strong>
                  </div>

                  <div>
                    <span>Hết hạn</span>
                    <strong>{formatDate(item.endDate)}</strong>
                  </div>

                  <div>
                    <span>Đơn tối thiểu</span>
                    <strong>
                      {Number(item.minOrderValue || 0).toLocaleString("vi-VN")} VNĐ
                    </strong>
                  </div>

                  <div>
                    <span>Giảm tối đa</span>
                    <strong>
                      {item.maxDiscount
                        ? `${Number(item.maxDiscount).toLocaleString("vi-VN")} VNĐ`
                        : "Không giới hạn"}
                    </strong>
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

export default Promotions;
