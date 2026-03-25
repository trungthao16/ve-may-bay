import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

function TrainList() {
  const [, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const from = query.get("from") || "";
  const to = query.get("to") || "";
  const date = query.get("date") || "";

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await API.get("/trains");
        setTrains(res.data);

        let result = res.data;

        if (from) {
          result = result.filter((t) =>
            t.from.toLowerCase().includes(from.toLowerCase())
          );
        }

        if (to) {
          result = result.filter((t) =>
            t.to.toLowerCase().includes(to.toLowerCase())
          );
        }

        setFilteredTrains(result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [from, to]);

  return (
    <div className="trainlist-page">
      <div className="rv-container trainlist-wrap">
        <div className="trainlist-header">
          <p className="section-label">Kết quả tìm kiếm</p>
          <h1 className="trainlist-title">Danh sách chuyến tàu</h1>
          <p className="trainlist-sub">
            Tuyến: <strong>{from || "Tất cả"}</strong> →{" "}
            <strong>{to || "Tất cả"}</strong>
            {date && <> | Ngày đi: <strong>{date}</strong></>}
          </p>
        </div>

        {loading ? (
          <div className="empty-box">Đang tải dữ liệu chuyến tàu...</div>
        ) : filteredTrains.length === 0 ? (
          <div className="empty-box">Không tìm thấy chuyến tàu phù hợp.</div>
        ) : (
          <div className="train-grid">
            {filteredTrains.map((train) => (
              <div className="train-card" key={train._id}>
                <div className="train-top">
                  <div>
                    <span className="train-badge">Tàu chạy</span>
                    <h3>{train.trainName}</h3>
                  </div>
                  <div className="train-price">
                    {train.price?.toLocaleString("vi-VN")}đ
                  </div>
                </div>

                <div className="train-route">
                  <div>
                    <p>Ga đi</p>
                    <h4>{train.from}</h4>
                  </div>
                  <div className="route-arrow">→</div>
                  <div>
                    <p>Ga đến</p>
                    <h4>{train.to}</h4>
                  </div>
                </div>

                <div className="train-meta">
<div>
    <span>Ngày khởi hành</span>
    <strong>
      {train.departureDate
        ? new Date(train.departureDate).toLocaleDateString("vi-VN")
        : "Chưa có"}
    </strong>
  </div>

                  <div>
                    <span>Khởi hành</span>
                    <strong>{train.departureTime}</strong>
                  </div>
                  <div>
                    <span>Đến nơi</span>
                    <strong>{train.arrivalTime}</strong>
                  </div>
                  <div>
                    <span>Số ghế</span>
                    <strong>{train.totalSeats || 0}</strong>
                  </div>
                </div>

                <button
                  className="book-btn"
                  onClick={() => navigate(`/booking/${train._id}`)}
                >
                  Đặt vé ngay
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainList;